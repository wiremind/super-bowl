import CMessageTable from '@/components/CMessageTable';
import CJobTable from '@/components/CJobTable';
import CEnqueueForm from '@/components/CEnqueueForm';
import CNotFound from '@/components/CNotFound';
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
