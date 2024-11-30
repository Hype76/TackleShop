import type { TackleShop } from '../../data/shops';

declare global {
    interface Window {
        showAddShopDialog: () => void;
        closeDialog: () => void;
    }
}

export function initializeForm() {
    const dialog = document.getElementById('addShopDialog') as HTMLDialogElement;
    const form = document.getElementById('addShopForm') as HTMLFormElement;
    const jsonInput = document.getElementById('jsonInput') as HTMLTextAreaElement;

    if (!dialog || !form) {
        console.error('Required form elements not found');
        return;
    }

    // Define global functions
    window.showAddShopDialog = () => {
        dialog.showModal();
    };

    window.closeDialog = () => {
        dialog.close();
        form.reset();
    };

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show/hide content
            tabContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${tab}Tab`) {
                    content.classList.remove('hidden');
                }
            });
        });
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let newShop: TackleShop;
        const activeTab = document.querySelector('.tab-button.active');

        if (activeTab?.getAttribute('data-tab') === 'json') {
            try {
                newShop = JSON.parse(jsonInput?.value || '{}');
                
                // Validate required fields
                const requiredFields = ['name', 'address', 'city', 'postcode', 'region'];
                const missingFields = requiredFields.filter(field => !newShop[field]);
                
                if (missingFields.length > 0) {
                    alert(`Missing required fields: ${missingFields.join(', ')}`);
                    return;
                }

                // Ensure specialties is always an array
                if (newShop.specialties && !Array.isArray(newShop.specialties)) {
                    newShop.specialties = String(newShop.specialties).split(',').map(s => s.trim());
                }
            } catch (error) {
                alert('Invalid JSON format. Please check your input.');
                return;
            }
        } else {
            const formData = new FormData(form);
            const specialtiesStr = formData.get('specialties') as string;
            
            newShop = {
                name: formData.get('name') as string,
                address: formData.get('address') as string,
                city: formData.get('city') as string,
                postcode: formData.get('postcode') as string,
                region: formData.get('region') as string,
                phone: formData.get('phone') as string || undefined,
                website: formData.get('website') as string || undefined,
                specialties: specialtiesStr ? specialtiesStr.split(',').map(s => s.trim()) : undefined
            };
        }

        // Dispatch custom event with new shop data
        window.dispatchEvent(new CustomEvent('shopAdded', { 
            detail: newShop,
            bubbles: true
        }));

        window.closeDialog();
    });

    // Auto-format postcode input
    const postcodeInput = document.getElementById('postcode') as HTMLInputElement;
    postcodeInput?.addEventListener('input', (e) => {
        const input = e.target as HTMLInputElement;
        let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Add space in the correct position for UK postcodes
        if (value.length > 3) {
            const inward = value.slice(-3);
            const outward = value.slice(0, -3);
            value = `${outward} ${inward}`;
        }
        
        input.value = value;
    });
}