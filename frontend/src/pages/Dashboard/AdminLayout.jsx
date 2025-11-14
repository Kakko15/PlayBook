import { Outlet } from 'react-router-dom';
import AdminNavRail from './AdminNavRail';

const AdminLayout = () => {
  return (
    <div className='flex h-screen min-h-screen w-full bg-background'>
      <AdminNavRail />
      <main className='flex-1 overflow-y-auto bg-surface-variant/20'>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
