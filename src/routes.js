import CMessageTable from '@/components/CMessageTable';
import CJobTable from '@/components/CJobTable';
const routes = [
  { path: '/', component: CMessageTable, name: 'Messages' },
  { path: '/jobs', component: CJobTable, name: 'Scheduled Jobs' }
];

export default routes;
