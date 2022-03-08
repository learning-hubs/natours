import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_51JSNkUSI2qB0FZvWS0iwKPhqZcDky3SnCwReUek5SNfbuyZrSI8Qnm1M6lGYcZjnObCQtziqxrDpvzJlcti1nU6M00IQ5cY73m');

export const bookTour = async (tourId) => {
    try {
               
        const test = document.cookie.split(';')[1].split('=')[1];
        //1. get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}/${test}`);
        //2. create checkout form + charge credit card
    
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch(e) {
        console.log(e);
        showAlert('error', e);
    }

};