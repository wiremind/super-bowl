import CMessageTable from '@/components/CMessageTable';
import CJobTable from '@/components/CJobTable';
import CEnqueue from '@/components/CEnqueue';
import CNotFound from '@/components/CNotFound';
const routes = [
  { path: '/', component: CMessageTable, name: 'Messages' },
  { path: '/jobs', component: CJobTable, name: 'Scheduled Jobs' },
  { path: '/enqueue', component: CEnqueue, name: 'Enqueue' },
  { path: '*', component: CNotFound }
];

export default routes;
