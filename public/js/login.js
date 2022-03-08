//install helmet@3 as higher versions would cause issue in loading axios
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    console.log(email, password);
    try {
       
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
          data: {
                email,
                password
            }
        });
        const token = res.data.token;
        const expCookie = res.data.cookieOptions.expires;
        
        document.cookie = `jwt=${token}; expires=${expCookie}`;

        if(res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
               location.assign('/');  
            }, 1500);
        }
        
        console.log('Login Result: ', res.data);
    } catch(err) {
        showAlert('error', err.message);
    }
    
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
        });
        
        if(res.data.status = 'success') {  
            const expCookie = res.data.cookieOptions.expires;
            document.cookie = `jwt=; expires=${expCookie}`;
            console.log('Document Cookie: ', document.cookie);
            location.reload(true);
        }
    } catch(err) {
        console.log(err.response);
        showAlert('error', 'Error Logging out! Try again.');
    }
}

