import CMessageTable from '@/messages/components/CMessageTable';
import CJobTable from '@/schedule/components/CJobTable';
import CEnqueueForm from '@/enqueue/components/CEnqueueForm';
import CNotFound from '@/shared/components/CNotFound';
const routes = [
  { path: '/', component: CMessageTable, name: 'Messages', meta: { requiresRefreshButton: true } },
  {
    path: '/jobs',
    component: CJobTable,
    name: 'Scheduled Jobs',
    meta: { requiresRefreshButton: true }
  },
  { path: '/enqueue', component: CEnqueueForm, name: 'Enqueue' },
  { path: '*', component: CNotFound }
];

export default routes;
