// ========================================
// VANTEX - FUNCIONALIDADES INTERACTIVAS
// ========================================

// Scroll suave a formulario
function scrollToForm() {
    const formSection = document.getElementById('contacto');
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// Descargar Executive Briefing
function downloadBriefing() {
    // Crear un enlace temporal para descargar el PDF
    const link = document.createElement('a');
    link.href = 'assets/EXECUTIVE_BRIEFING_VANTEX.pdf';
    link.download = 'EXECUTIVE_BRIEFING_VANTEX.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Manejar envío de formulario
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    // Recopilar datos del formulario
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        phone: formData.get('phone'),
        sector: formData.get('sector'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    // Mostrar mensaje de envío
    formMessage.style.display = 'block';
    formMessage.style.color = '#ff8c00';
    formMessage.innerHTML = '⏳ Enviando solicitud...';
    
    // Enviar a Formspree (servicio gratuito para formularios)
    fetch('https://formspree.io/f/mlgpwdkk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: data.name,
            email: data.email,
            company: data.company,
            phone: data.phone,
            sector: data.sector,
            message: data.message,
            _subject: `Nueva solicitud de validación de ${data.company}`,
            _replyto: data.email
        })
    })
    .then(response => {
        if (response.ok) {
            // Guardar también en localStorage como backup
            const leads = JSON.parse(localStorage.getItem('vantex_leads') || '[]');
            leads.push(data);
            localStorage.setItem('vantex_leads', JSON.stringify(leads));
            
            // Mostrar mensaje de éxito
            formMessage.style.color = '#4CAF50';
            formMessage.innerHTML = '✓ Solicitud enviada exitosamente. Nos pondremos en contacto en 24 horas.';
            
            // Limpiar formulario
            form.reset();
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        } else {
            throw new Error('Error en la respuesta del servidor');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        formMessage.style.color = '#f44336';
        formMessage.innerHTML = '✗ Error al enviar. Por favor, intenta de nuevo.';
        
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
}

// Analytics básico (Google Analytics, Mixpanel, etc.)
function trackEvent(eventName, eventData) {
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    console.log(`Event tracked: ${eventName}`, eventData);
}

// Rastrear clics en botones CTA
document.addEventListener('DOMContentLoaded', function() {
    const ctaButtons = document.querySelectorAll('.primary-btn, .secondary-btn, .cta-button');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('cta_click', {
                button_text: this.textContent,
                button_class: this.className
            });
        });
    });
    
    // Rastrear scroll
    window.addEventListener('scroll', function() {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercentage > 25 && !window.scrollTracked25) {
            trackEvent('scroll_25', { scroll_percentage: 25 });
            window.scrollTracked25 = true;
        }
        if (scrollPercentage > 50 && !window.scrollTracked50) {
            trackEvent('scroll_50', { scroll_percentage: 50 });
            window.scrollTracked50 = true;
        }
    });
});

// Función para obtener leads guardados (para admin)
function getLeads() {
    return JSON.parse(localStorage.getItem('vantex_leads') || '[]');
}

// Función para exportar leads a CSV
function exportLeadsToCSV() {
    const leads = getLeads();
    if (leads.length === 0) {
        alert('No hay leads para exportar');
        return;
    }
    
    // Crear CSV
    let csv = 'Nombre,Email,Empresa,Teléfono,Sector,Mensaje,Fecha\n';
    leads.forEach(lead => {
        csv += `"${lead.name}","${lead.email}","${lead.company}","${lead.phone}","${lead.sector}","${lead.message}","${lead.timestamp}"\n`;
    });
    
    // Descargar CSV
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `vantex_leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Función para limpiar leads
function clearLeads() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los leads?')) {
        localStorage.removeItem('vantex_leads');
        alert('Leads eliminados');
    }
}

// Exportar funciones para uso externo
window.vantexApp = {
    scrollToForm,
    downloadBriefing,
    handleFormSubmit,
    trackEvent,
    getLeads,
    exportLeadsToCSV,
    clearLeads
};
