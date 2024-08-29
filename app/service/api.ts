import axios from 'axios'

export default axios.create({
    baseURL: 'https://smartmiz-backend.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
})