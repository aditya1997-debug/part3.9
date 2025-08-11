const Filter = ({searchTerm, handleSearch}) => {
    return (
      <div>
        Search: <input value={searchTerm} onChange={handleSearch}/>
      </div>
    )
}

export default Filter