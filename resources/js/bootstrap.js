import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';


window.axios.interceptors.response.use(
    response => response,
    error => {
        if (!error.response) {
            // Network error (Offline)
            const pendingRequests = JSON.parse(localStorage.getItem('pending_requests') || '[]');
            pendingRequests.push({ url: error.config.url, method: error.config.method, data: error.config.data });
            localStorage.setItem('pending_requests', JSON.stringify(pendingRequests));
            alert('Koneksi terputus! Data disimpan secara lokal dan akan dikirim ulang saat online.');
        }
        return Promise.reject(error);
    }
);
