'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentOrders from '../../components/admin/RecentOrders';
import LowStockProducts from '../../components/admin/LowStockProducts';
import SalesChart from '../../components/admin/SalesChart';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (session?.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === 'ADMIN') {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/estadisticas');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al panel de administración</p>
        </div>

        <DashboardStats stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-6">Ventas Mensuales</h2>
              <div className="h-80">
                <SalesChart data={stats.ventasMensuales || []} />
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-6">Productos Bajo Stock</h2>
              <LowStockProducts />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white rounded-xl shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">Pedidos Recientes</h2>
              <RecentOrders />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}