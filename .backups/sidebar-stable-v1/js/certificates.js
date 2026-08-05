window.Certificates = {
    generateAndDownload: function(title, name, date) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#0a0f19';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Outer Border
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Inner Border
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

        // Title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 100);

        // Subtitle
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '20px Arial';
        ctx.fillText('This is to certify that', canvas.width / 2, 180);

        // Name
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 50px Arial';
        ctx.fillText(name || 'Arcade Player', canvas.width / 2, 260);

        // Description
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '20px Arial';
        ctx.fillText('has successfully achieved the title of', canvas.width / 2, 340);
        
        // Award Title
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 30px Arial';
        ctx.fillText(title, canvas.width / 2, 400);

        // Date
        ctx.fillStyle = '#aaa';
        ctx.font = '16px Arial';
        const dateStr = date || new Date().toLocaleDateString();
        ctx.fillText(`Date: ${dateStr}`, canvas.width / 2, 480);

        // Fake QR Code
        ctx.fillStyle = '#fff';
        ctx.fillRect(650, 450, 80, 80);
        ctx.fillStyle = '#000';
        ctx.fillRect(660, 460, 20, 20);
        ctx.fillRect(700, 460, 20, 20);
        ctx.fillRect(660, 500, 20, 20);
        ctx.fillRect(690, 490, 30, 30);
        
        // Trigger Download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `certificate_${title.replace(/\\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-view-certificates');
    if (btn) {
        btn.addEventListener('click', () => {
            let level = 1;
            let xp = 0;
            if (window.Gamification) {
                const state = window.Gamification.getState();
                level = state.level;
                xp = state.xp;
            }
            window.Certificates.generateAndDownload(`Level ${level} Master (${xp} XP)`, 'Cyber Arcade User', new Date().toLocaleDateString());
        });
    }
});
