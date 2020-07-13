import CMessageTable from '@/components/CMessageTable';
import CJobTable from '@/components/CJobTable';
import CEnqueueForm from '@/components/CEnqueueForm';
import CNotFound from '@/components/CNotFound';
import CGroupTable from '@/components/CGroupTable';
import CPipeTable from '@/components/CPipeTable';

const routes = [
  { path: '/', component: CMessageTable, name: 'Messages', meta: { requiresRefreshButton: true } },
  {
    path: '/groups',
    component: CGroupTable,
    name: 'Groups',
    meta: { requiresRefreshButton: true }
  },
  {
    path: '/pipelines',
    component: CPipeTable,
    name: 'Pipelines'
  },
  { path: '/jobs', component: CJobTable, name: 'Scheduled Jobs' },
  { path: '/enqueue', component: CEnqueueForm, name: 'Enqueue' },
  { path: '*', component: CNotFound }
];

export default routes;
