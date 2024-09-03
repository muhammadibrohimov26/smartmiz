import axios from 'axios'

export default axios.create({
    baseURL: 'https://smartwebsite-2dd5c535c591.herokuapp.com',
    headers: {
        'Content-Type': 'application/json'
    }
})