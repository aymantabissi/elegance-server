import CategoryLinks from './CategoryLinks';
import SidebarProductFilter from './SidebarProductFilter';

const Sidebar = ({ products, setFilteredProducts, categories }) => {
  return (
    <div className="hidden md:block md:w-1/5 border-r border-gray-200 p-4 bg-white h-screen overflow-y-auto">
      {/* Category Links */}
      <CategoryLinks />

      {/* Product Filter */}
      <SidebarProductFilter 
        products={products}
        setFilteredProducts={setFilteredProducts}
        categories={categories}
      />
    </div>
  );
};

export default Sidebar;
