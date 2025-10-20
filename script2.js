
    // Numéro WhatsApp du salon (format international, sans + ni espaces — ex: France mobile 06 => 336XXXXXXXX)
    const WHATSAPP_NUMBER = '+243841492642'; // format international pour 08 41 49 26 42

    // Initialisation : date min = aujourd'hui
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Mettre à jour le prix estimé quand on change de service
    const serviceRadios = Array.from(document.querySelectorAll('input[name="service"]'));
    const prixEl = document.getElementById('prix');
    let selectedPrice = 0;
    function updatePrice(){
      const sel = serviceRadios.find(r => r.checked);
      if(!sel){ prixEl.textContent = "—"; selectedPrice = 0; return; }
      selectedPrice = Number(sel.dataset.price) || 0;
      prixEl.textContent = selectedPrice + "€";
    }
    serviceRadios.forEach(r => r.addEventListener('change', updatePrice));

    // Style de sélection du coiffeur
    document.querySelectorAll('.coiffeur').forEach(label=>{
      const input = label.querySelector('input');
      input.addEventListener('change', ()=>{
        document.querySelectorAll('.coiffeur').forEach(l=>l.classList.remove('selected'));
        if(input.checked) label.classList.add('selected');
      });
      // clic sur toute la carte
      label.addEventListener('click', ()=>{ input.checked = true; input.dispatchEvent(new Event('change')); });
    });

    // Soumission : validation simple + envoi vers WhatsApp
    document.getElementById('btn-submit').addEventListener('click', (e)=>{
      e.preventDefault();
      const name = document.getElementById('client-name').value.trim();
      const phone = document.getElementById('client-phone').value.trim();
      const email = document.getElementById('client-email').value.trim();
      const service = document.querySelector('input[name="service"]:checked');
      const coiffeur = document.querySelector('input[name="coiffeur"]:checked');
      const date = dateInput.value;
      const time = document.getElementById('time').value;
      const notes = document.getElementById('notes').value.trim();

      if(!service){ alert('Veuillez choisir une prestation.'); return; }
      if(!name){ alert('Veuillez indiquer votre nom.'); return; }
      if(!date){ alert('Veuillez choisir une date.'); return; }

      // Récapitulatif affiché sur la page
      const summary = document.getElementById('summary');
      summary.style.display = 'block';
      summary.innerHTML = `
        <strong>Récapitulatif</strong>
        <div>Prestation : ${service.value} — <span style="color:var(--dore)">${service.dataset.price}€</span></div>
        <div>Coiffeur : ${coiffeur ? coiffeur.value : 'Aucun choisi'}</div>
        <div>Date & heure : ${date}${time ? ' à ' + time : ''}</div>
        <div>Nom : ${name}${phone ? ' · ' + phone : ''}${email ? ' · ' + email : ''}</div>
        ${notes ? '<div>Notes : ' + notes + '</div>' : ''}
        <div style="margin-top:8px;color:var(--muted)">Vous allez être redirigé(e) vers WhatsApp pour finaliser la réservation.</div>
      `;

      // Construire le message WhatsApp
      const msg = [
        "Bonjour, je souhaite réserver une prestation au salon Clair de Lune.",
        `Prestation: ${service.value} — ${service.dataset.price}€`,
        `Coiffeur: ${coiffeur ? coiffeur.value : 'Aucune préférence'}`,
        `Date: ${date}${time ? ' à ' + time : ''}`,
        `Nom: ${name}${phone ? ' · Tel: ' + phone : ''}${email ? ' · Email: ' + email : ''}`,
        notes ? `Notes: ${notes}` : ''
      ].filter(Boolean).join('\n');

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

      // Ouvrir WhatsApp dans un nouvel onglet / application (selon appareil)
      window.open(waUrl, '_blank');
    });
 