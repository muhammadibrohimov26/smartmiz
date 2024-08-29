'use server';
import axios from './api'; // Ensure axios is properly configured with base URL

export interface Price {
    // Define the structure of the price data returned from the API
    
        courseName:string
        coursePrice:number
        courseTime:string
        courseType:string
        image:string
    
    // Add other fields as needed
}

const getPrices = async (): Promise<Price[]> => {
    try {
        const response = await axios.get<Price[]>('/prices');
        return response.data; // Assuming the backend sends back an array of prices
    } catch (error: any) {
        // Better error handling for debugging
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Backend returned an error:', error.response.data);
            throw new Error(`Failed to fetch prices: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            throw new Error('Failed to fetch prices: No response from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
            throw new Error('Error setting up request');
        }
    }
}

export { getPrices };
