'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useSimpleAdminAuth } from '@/hooks/useSimpleAdminAuth';
import { Ship } from '@/types/database';

export default function AdminShips() {
  const { loading: authLoading, isAuthenticated } = useSimpleAdminAuth();
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchShips();
    } else if (!authLoading) {
      // If auth loaded but user is not authenticated, stop loading
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('Ships page loading timeout');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchShips = async () => {
    setLoading(true);
    try {
      console.log('Fetching ships...');
      const { data, error } = await supabase
        .from('ships')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching ships:', error);
        throw error;
      }

      console.log('Ships fetched:', data?.length || 0);
      setShips(data || []);
    } catch (error) {
      console.error('Error fetching ships:', error);
      alert('Failed to load ships. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const deleteShip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ship? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the ships list
      fetchShips();
    } catch (error) {
      console.error('Error deleting ship:', error);
      alert('Failed to delete ship. Please try again.');
    }
  };

  const toggleShipStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ships')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Refresh the ships list
      fetchShips();
    } catch (error) {
      console.error('Error updating ship status:', error);
      alert('Failed to update ship status. Please try again.');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ship Management</h1>
            <p className="text-gray-600 mt-2">Manage your fleet of cruise ships and expedition vessels</p>
          </div>
          <Link
            href="/admin/ships/new"
            className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Add New Ship
          </Link>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <Link href="/admin" className="text-gray-600 hover:text-[#B8860B] transition-colors">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#B8860B] font-medium">Ships</span>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ships...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Ships</h3>
                <p className="text-3xl font-bold text-[#B8860B]">{ships.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Active Ships</h3>
                <p className="text-3xl font-bold text-green-600">
                  {ships.filter(ship => ship.is_active).length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Capacity</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {ships.reduce((sum, ship) => sum + ship.capacity, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Featured Ships</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {ships.filter(ship => ship.is_featured).length}
                </p>
              </div>
            </div>

            {/* Ships List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Ships</h3>
              </div>

              {ships.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No ships found</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first ship to the fleet.</p>
                  <Link
                    href="/admin/ships/new"
                    className="bg-[#B8860B] hover:bg-[#DAA520] text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Add Your First Ship
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ship
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type & Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Operating Regions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ships.map((ship) => (
                        <motion.tr
                          key={ship.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                {ship.images && ship.images[0] ? (
                                  <img
                                    className="h-12 w-12 rounded-md object-cover"
                                    src={ship.images[0]}
                                    alt={ship.name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{ship.name}</div>
                                <div className="text-sm text-gray-500">{ship.ship_type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ship.ship_type}</div>
                            <div className="text-sm text-gray-500">{ship.capacity} passengers</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ship.operating_regions && ship.operating_regions.length > 0
                                ? ship.operating_regions.join(', ')
                                : 'Not specified'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                ship.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {ship.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {ship.is_featured && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/ships/${ship.id}/edit`}
                                className="text-[#B8860B] hover:text-[#DAA520] transition-colors"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => toggleShipStatus(ship.id, ship.is_active || false)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                {ship.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteShip(ship.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}