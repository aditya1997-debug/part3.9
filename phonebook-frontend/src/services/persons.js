import axios from 'axios';
const base_url = '/api/persons'


const getAll = () => {
    const result = axios.get(base_url)
    // console.log(result)
    return result.then(response => response.data)
                
}

const create = (person) => {
    const result = axios.post(base_url, person)
    return result.then(response => response.data)
                
}


const delete_person = (id) => {
    console.log("Function",id)
    const response = axios.delete(`${base_url}/${id}`)
    return response.then(response => response.data)
}


const update_person = (id, data) => {
    console.log("Function",id)
    const response = axios.put(`${base_url}/${id}`, data)
    return response.then(response => response.data)
}

export { getAll, create, delete_person, update_person }