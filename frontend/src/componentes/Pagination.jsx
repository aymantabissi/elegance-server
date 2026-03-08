import PropTypes from "prop-types"; // Importer PropTypes

const Pagination = ({ currentPage, paginate, pageNumbers }) => {
  return (
    <div className="flex justify-center mt-6">
      <ul className="flex items-center space-x-4">
        <li>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded-md ${
                currentPage === number ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              } hover:bg-gray-300`}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === pageNumbers.length}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  );
};

// Ajouter la validation des props
Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired, // currentPage doit être un nombre
  paginate: PropTypes.func.isRequired, // paginate doit être une fonction
  pageNumbers: PropTypes.arrayOf(PropTypes.number).isRequired, // pageNumbers doit être un tableau de nombres
};

export default Pagination;
