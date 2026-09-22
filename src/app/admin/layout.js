export const metadata = {
  title: 'Pedidos · Hispanos Pharmacy',
  // Staff-only page: keep it out of search results
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
