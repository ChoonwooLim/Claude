import { initializeApiManagement } from './api.js';
import { initializeUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApiManagement();
    initializeUI();
}); 