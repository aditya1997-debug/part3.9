import { useState, useEffect } from 'react';
import Persons from './components/persons';
import PersonForm from './components/personForm';
import Filter from './components/filter';
import Notification from './components/Notification';
import Del from './components/delete_button';
import { getAll, create, delete_person, update_person } from './services/persons';
import axios from 'axios';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationMessage, setNotificationMessage] = useState({ message: null, flag: null });

  useEffect(() => {
    getAll()
      .then(data => setPersons(data))
      .catch(error => {
        setNotificationMessage({
          message: 'Failed to fetch contacts.',
          flag: 'error'
        });
        setTimeout(() => {
          setNotificationMessage({ message: null, flag: null });
        }, 5000);
      });
  }, []);

  const handleNameChange = (event) => setNewName(event.target.value);
  const handleNumberChange = (event) => setNumber(event.target.value);
  const handleSearch = (event) => setSearchTerm(event.target.value);

  console.log("Persons", persons)
  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPerson = (event) => {
    event.preventDefault();

    if (newName.trim() === '') {
      alert('Name cannot be empty');
      return;
    }

    if (newNumber.trim() === '') {
      alert('Number cannot be empty');
      return;
    }

    const person_exists = persons.findIndex(p => p.name.toUpperCase() === newName.toUpperCase());
    const number_exists = persons.some(p => p.number === newNumber);

    if (person_exists !== -1) {
      if (window.confirm(`${newName.toUpperCase()} is already added to phonebook, replace the old number with new one?`)) {
        if (number_exists) {
          alert(`${newNumber} is already associated with a different person.`);
          setNewName('');
          setNumber('');
          return;
        }

        const updated_person = { ...persons[person_exists], number: newNumber };
        console.log("updated_person", updated_person)
        update_person(`${persons[person_exists].id}`, updated_person)
          .then(data => {
            console.log("response ==>", data)
            setNotificationMessage({
              message: `${newName}'s number has been updated`,
              flag: 'notification'
            });
            setTimeout(() => {
              setNotificationMessage({ message: null, flag: null });
            }, 5000);

            console.log("====>",data.id)
            setPersons(persons.map(person => 
              person.id === data.id ? data : person
            ));
          })
          .catch(error => {
            console.log("error",error)
            setNotificationMessage({
              message: `Information of ${newName} has already been deleted from server`,
              flag: 'error'
            });
            setTimeout(() => {
              setNotificationMessage({ message: null, flag: null });
            }, 5000);
          });
      }

      setNewName('');
      setNumber('');
      return;
    } else if (number_exists) {
      alert(`${newNumber} is already associated with a different person.`);
      setNewName('');
      setNumber('');
      return;
    }

    const personObject = { name: newName, number: newNumber };

    create(personObject)
      .then(data => {
        console.log('==================>', data)
        setNotificationMessage({
          message: `Added ${newName}`,
          flag: 'notification'
        });
        setTimeout(() => {
          setNotificationMessage({ message: null, flag: null });
        }, 5000);

        setPersons(persons.concat(data));
        setNewName('');
        setNumber('');
      })
      .catch(error => {
        console.log("error =======>", error)
        setNotificationMessage({
          message: `Failed to save person: ${error.message}`,
          flag: 'error'
        });
        setTimeout(() => {
          setNotificationMessage({ message: null, flag: null });
        }, 5000);
      });
  };

  const handleDelete = (id) => {
    const person = persons.find(obj => obj.id === id);
    if (window.confirm(`Delete ${person.name}?`)) {
      delete_person(id)
        .then(() => {
          setPersons(persons.filter(obj => obj.id !== id));
          setNotificationMessage({
            message: `${person.name} has been deleted`,
            flag: 'notification'
          });
          setTimeout(() => {
            setNotificationMessage({ message: null, flag: null });
          }, 5000);
        })
        .catch(() => {
          setNotificationMessage({
            message: `Information of ${person.name} has already been removed from server`,
            flag: 'error'
          });
          setTimeout(() => {
            setNotificationMessage({ message: null, flag: null });
          }, 5000);
        });
    }
  };

  return (
    <div>
      <Filter searchTerm={searchTerm} handleSearch={handleSearch} />
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} />
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      {filteredPersons.map(person => (
        <div key={person.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Persons name={person.name} number={person.number} />
          <Del handleDelete={() => handleDelete(person.id)} />
        </div>
      ))}
    </div>
  );
};

export default App;
