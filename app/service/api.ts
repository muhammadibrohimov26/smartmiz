import axios from 'axios'

export default axios.create({
    baseURL: 'https://smartmizbackend.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
}) 
