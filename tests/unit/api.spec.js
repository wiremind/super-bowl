import api from '@/api';

const DateTime = global.Date;
const date = new Date('2021-05-01 10:00:00');
jest.spyOn(global, 'Date').mockImplementation((...args) => {
  if (args.length) {
    return new DateTime(...args);
  }
  return date;
});

test('Test simple message parsing', () => {
  const message = {
    priority: 0,
    message_id: 'id',
    status: 'Started',
    actor_name: 'do_work',
    progress: 0.1,
    enqueued_datetime: '2021-05-01 10:00:00',
    started_datetime: '2021-05-01 10:00:00',
    end_datetime: '2021-05-01 10:00:00',
    options: { group_info: { group_id: 'group_id' } }
  };
  expect(api.parseMessages([message]).messages[0]).toMatchObject({
    priority: 0,
    messageId: 'id',
    status: 'Started',
    actorName: 'do_work',
    progress: 0.1,
    enqueuedDatetime: new Date('2021-05-01 10:00:00'),
    startedDatetime: new Date('2021-05-01 10:00:00'),
    endDatetime: new Date('2021-05-01 10:00:00'),
    groupId: 'group_id'
  });
});

describe('Wait time computing', () => {
  it('is undefined when there is no enqueuedDatetime', () => {
    expect(api.parseMessages([{}]).messages[0].waitTime).toBe(undefined);
  });
  it('works when there is no startedDatetime', () => {
    expect(
      api.parseMessages([{ enqueued_datetime: '2021-05-01 09:30:00' }]).messages[0].waitTime
    ).toBe(1800000);
  });
  it('works when there is a startedDatetime', () => {
    expect(
      api.parseMessages([
        { enqueued_datetime: '2021-05-01 09:30:00', started_datetime: '2021-05-01 10:00:00' }
      ]).messages[0].waitTime
    ).toBe(1800000);
  });
  it('works with a composition', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          enqueued_datetime: '2021-05-01 09:30:00',
          started_datetime: '2021-05-01 09:30:10',
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        },
        {
          message_id: 'id1',
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        },
        {
          message_id: 'id2',
          enqueued_datetime: '2021-05-01 09:50:00',
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        }
      ]).messages[0].waitTime
    ).toBe(610000);
  });
});

describe('Execution time computing', () => {
  it('is undefined when there is no startedDatetime', () => {
    expect(api.parseMessages([{}]).messages[0].executionTime).toBe(undefined);
  });
  it('works when there is no endDatetime', () => {
    expect(
      api.parseMessages([{ started_datetime: '2021-05-01 09:30:00' }]).messages[0].executionTime
    ).toBe(1800000);
  });
  it('works when there is a endDatetime', () => {
    expect(
      api.parseMessages([
        { started_datetime: '2021-05-01 09:30:00', end_datetime: '2021-05-01 10:00:00' }
      ]).messages[0].executionTime
    ).toBe(1800000);
  });
  it('works with a composition', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          started_datetime: '2021-05-01 09:30:00',
          end_datetime: '2021-05-01 09:30:10',
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        },
        {
          message_id: 'id1',
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        },
        {
          message_id: 'id2',
          started_datetime: '2021-05-01 09:50:00',
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        }
      ]).messages[0].executionTime
    ).toBe(610000);
  });
});

describe('Remaining time computing', () => {
  it('is undefined when there is no progress', () => {
    expect(
      api.parseMessages([{ started_datetime: '2021-05-01 10:00:00' }]).messages[0].remainingTime
    ).toBe(undefined);
  });
  it('works when there is progress', () => {
    expect(
      api.parseMessages([{ started_datetime: '2021-05-01 09:30:00', progress: 0.5 }]).messages[0]
        .remainingTime
    ).toBe(1800000);
  });
  it('is undefined when task is finished', () => {
    expect(
      api.parseMessages([
        {
          started_datetime: '2021-05-01 09:30:00',
          progress: 0.5,
          end_datetime: '2021-05-01 10:00:00'
        }
      ]).messages[0].waitTime
    ).toBe(undefined);
  });
  it('works with a composition', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          started_datetime: '2021-05-01 09:30:00',
          end_datetime: '2021-05-01 09:30:10',
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        },
        {
          message_id: 'id1',
          started_datetime: '2021-05-01 09:50:00',
          progress: 0.5,
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        },
        {
          message_id: 'id2',
          started_datetime: '2021-05-01 09:55:00',
          progress: 0.2,
          options: {
            composition_id: 'id',
            group_info: {
              group_id: 'grp_id'
            }
          }
        }
      ]).messages[0].remainingTime
    ).toBe(1200000);
  });
});

describe('Pipe target parsing', () => {
  it('works with a simple pipeline', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id1',
          options: {
            pipe_target: [{ message_id: 'id2', options: { pipe_target: [{ message_id: 'id3' }] } }]
          }
        }
      ]).messages
    ).toMatchObject([
      {
        messageId: 'id1',
        pipeTarget: [{ messageId: 'id2', pipeTarget: [{ messageId: 'id3' }] }]
      }
    ]);
  });
  it('works with a group in a pipeline', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id1',
          options: {
            pipe_target: [{ message_id: 'id2' }, { message_id: 'id3' }]
          }
        }
      ]).messages
    ).toMatchObject([
      { messageId: 'id1', pipeTarget: [{ messageId: 'id2' }, { messageId: 'id3' }] }
    ]);
  });
});

describe('Parsing a pipeline', () => {
  it('works with a simple pipeline', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id1',
          options: {
            composition_id: 'id',
            pipe_target: [
              {
                message_id: 'id2',
                options: {
                  composition_id: 'id',
                  pipe_target: [
                    {
                      message_id: 'id3',
                      options: {
                        composition_id: 'id'
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'pipeline',
        messages: [{ messageId: 'id1' }, { messageId: 'id2' }, { messageId: 'id3' }]
      }
    ]);
  });
  it('works with a pipeline containing a group', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id1',
          options: {
            composition_id: 'id',
            pipe_target: [
              {
                message_id: 'id2',
                options: {
                  composition_id: 'id',
                  group_info: { group_id: 'group_id' }
                }
              },
              {
                message_id: 'id3',
                options: {
                  composition_id: 'id',
                  group_info: { group_id: 'group_id' }
                }
              }
            ]
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'pipeline',
        messages: [
          { messageId: 'id1' },
          { type: 'group', messages: [{ messageId: 'id2' }, { messageId: 'id3' }] }
        ]
      }
    ]);
  });
});

describe('Parsing a group', () => {
  it('works with a simple group', () => {
    expect(
      api.parseMessages(
        ['id1', 'id2', 'id3'].map(id => {
          return {
            message_id: id,
            options: {
              group_info: {
                group_id: 'id'
              },
              composition_id: 'id'
            }
          };
        })
      ).messages
    ).toMatchObject([
      {
        type: 'group',
        messages: [{ messageId: 'id1' }, { messageId: 'id2' }, { messageId: 'id3' }]
      }
    ]);
  });
  it('works with a group containing pipelines', () => {
    expect(
      api.parseMessages(
        ['id1', 'id2', 'id3'].map(id => {
          return {
            message_id: id,
            options: {
              composition_id: 'id',
              pipe_target: [
                {
                  message_id: id + '_1',
                  options: {
                    composition_id: 'id',
                    group_info: {
                      group_id: 'group_id'
                    }
                  }
                }
              ]
            }
          };
        })
      ).messages
    ).toMatchObject([
      {
        type: 'group',
        messages: ['id1', 'id2', 'id3'].map(id => {
          return {
            type: 'pipeline',
            messages: [
              {
                messageId: id
              },
              {
                messageId: id + '_1'
              }
            ]
          };
        })
      }
    ]);
  });
});

test('Test complex composition parsing', () => {
  expect(
    api.parseMessages([
      {
        message_id: 'id0',
        options: {
          composition_id: 'id',
          pipe_target: [1, 2, 3, 4].map(n => {
            return {
              message_id: `id${n}`,
              options: {
                composition_id: 'id',
                group_info: {
                  group_id: `id_grp${Math.floor((n - 1) / 2)}`
                },
                pipe_target: [
                  {
                    message_id: `id${Math.floor((n - 1) / 2) + 5}`,
                    options: {
                      composition_id: 'id',
                      group_info: {
                        group_id: 'id_grp2'
                      },
                      pipe_target: [0, 1].map(m => {
                        return {
                          message_id: `id${m + 7}`,
                          options: {
                            composition_id: 'id',
                            group_info: {
                              group_id: 'id_grp3'
                            }
                          }
                        };
                      })
                    }
                  }
                ]
              }
            };
          })
        }
      }
    ]).messages
  ).toMatchObject([
    {
      type: 'pipeline',
      messages: [
        {
          messageId: 'id0'
        },
        {
          type: 'group',
          messages: [0, 1].map(i => {
            return {
              type: 'pipeline',
              messages: [
                {
                  type: 'group',
                  messages: [1, 2].map(j => {
                    return {
                      messageId: `id${2 * i + j}`
                    };
                  })
                },
                {
                  messageId: `id${i + 5}`
                }
              ]
            };
          })
        },
        {
          type: 'group',
          messages: [0, 1].map(k => {
            return {
              messageId: `id${k + 7}`
            };
          })
        }
      ]
    }
  ]);
});

describe('Composition status', () => {
  it('is Success when every message is Success', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'msg_id1',
          status: 'Success',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        },
        {
          message_id: 'msg_id2',
          status: 'Success',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'group',
        status: 'Success'
      }
    ]);
  });
  it('is Not yet enqueued when every message is Not yet enqueued', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'msg_id1',
          status: 'Not yet enqueued',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        },
        {
          message_id: 'msg_id2',
          status: 'Not yet enqueued',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'group',
        status: 'Not yet enqueued'
      }
    ]);
  });
  it('is Failure if a message is Failure', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          status: 'Failure',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        },
        {
          message_id: 'id1',
          status: 'Success',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'group',
        status: 'Failure'
      }
    ]);
  });
  it('is Skipped if a message is Skipped', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          status: 'Skipped',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        },
        {
          message_id: 'id1',
          status: 'Success',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'group',
        status: 'Skipped'
      }
    ]);
  });
  it('is Canceled if a message is Canceled', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          status: 'Canceled',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        },
        {
          message_id: 'id1',
          status: 'Success',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'group',
        status: 'Canceled'
      }
    ]);
  });
  it('is Started if a message is Started', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          status: 'Started',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        },
        {
          message_id: 'id1',
          status: 'Pending',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'group',
        status: 'Started'
      }
    ]);
  });
  it('is Pending if every message in the group is Pending', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          status: 'Started',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        },
        {
          message_id: 'id1',
          status: 'Pending',
          options: {
            group_info: {
              group_id: 'grp_id'
            },
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'group',
        status: 'Started'
      }
    ]);
  });
  it('is Pending if the first message of the pipeline is Pending', () => {
    expect(
      api.parseMessages([
        {
          message_id: 'id0',
          status: 'Pending',
          options: {
            pipe_target: [
              {
                message_id: 'id1'
              }
            ],
            composition_id: 'comp_id'
          }
        }
      ]).messages
    ).toMatchObject([
      {
        type: 'pipeline',
        status: 'Pending'
      }
    ]);
  });
});

test('Composition priority test', () => {
  expect(
    api.parseMessages([
      {
        message_id: 'id0',
        priority: 0,
        options: {
          composition_id: 'comp_id',
          group_info: {
            group_id: 'grp_id'
          }
        }
      },
      {
        message_id: 'id1',
        priority: 0,
        options: {
          composition_id: 'comp_id',
          group_info: {
            group_id: 'grp_id'
          }
        }
      }
    ]).messages
  ).toMatchObject([
    {
      type: 'group',
      priority: 0
    }
  ]);
});

describe('Composition started_time', () => {
  it('is correct for a group', () => {
    expect(
      api
        .parseMessages([
          {
            message_id: 'id0',
            started_datetime: '2021-05-01 11:00:00',
            options: {
              composition_id: 'comp_id',
              group_info: {
                group_id: 'grp_id'
              }
            }
          },
          {
            message_id: 'id1',
            started_datetime: '2021-05-01 10:00:00',
            options: {
              composition_id: 'comp_id',
              group_info: {
                group_id: 'grp_id'
              }
            }
          },
          {
            message_id: 'id2',
            options: {
              composition_id: 'comp_id',
              group_info: {
                group_id: 'grp_id'
              }
            }
          }
        ])
        .messages[0].startedDatetime.getTime()
    ).toBe(new Date('2021-05-01 10:00:00').getTime());
  });
  it('is correct for a pipeline', () => {
    expect(
      api
        .parseMessages([
          {
            message_id: 'id0',
            started_datetime: '2021-05-01 10:00:00',
            options: {
              composition_id: 'comp_id',
              pipe_target: [
                {
                  message_id: 'id1',
                  started_datetime: '2021-05-01 10:00:20',
                  options: {
                    composition_id: 'comp_id'
                  }
                }
              ]
            }
          },
          {
            message_id: 'id1',
            started_datetime: '2021-05-01 10:00:20',
            options: {
              composition_id: 'comp_id'
            }
          }
        ])
        .messages[0].startedDatetime.getTime()
    ).toBe(new Date('2021-05-01 10:00:00').getTime());
  });
});

test('Composition progress test', () => {
  expect(
    api.parseMessages([
      {
        message_id: 'id0',
        progress: 1,
        status: 'Success',
        options: {
          composition_id: 'comp_id',
          group_info: {
            group_id: 'grp_id'
          }
        }
      },
      {
        message_id: 'id1',
        progress: 0.5,
        options: {
          composition_id: 'comp_id',
          group_info: {
            group_id: 'grp_id'
          }
        }
      }
    ])
  );
});
