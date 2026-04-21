export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      <p className="mt-4 text-gray-500 font-medium">Memuat data Telkom...</p>
    </div>
  );
}