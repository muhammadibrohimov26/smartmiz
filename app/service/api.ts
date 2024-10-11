import axios from 'axios'

export default axios.create({
    baseURL: 'https://smartmiz-2462bfd28095.herokuapp.com',
    headers: {
        'Content-Type': 'application/json'
    }
})