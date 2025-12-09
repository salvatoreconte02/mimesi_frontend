// Mock data initialization for demo purposes
export const initializeMockData = () => {
  // Check if data already exists
  const existingLavorazioni = localStorage.getItem('mimesi_all_lavorazioni');
  const existingDoctorInbox = localStorage.getItem('mimesi_doctor_inbox');
  const existingAdminInbox = localStorage.getItem('mimesi_admin_inbox');

  // Initialize Lavorazioni if empty
  if (!existingLavorazioni || JSON.parse(existingLavorazioni).length === 0) {
    const mockLavorazioni = [
      {
        id: 'REQ-1765268339619',
        paziente: 'Gigante Davide',
        dottore: 'Beppe Bergomi',
        tipo: '1 Elem. zirconio',
        data: '09/12/2024',
        stato: 'working',
        progress: 45,
        statusLabel: 'Fresatura in Corso',
        fullData: {
          id: 'REQ-1765268339619',
          nome: 'Davide',
          cognome: 'Gigante',
          nomeDottore: 'Beppe',
          cognomeDottore: 'Bergomi',
          nomeStudio: 'Studio Bergomi',
          elements: [{ number: '1.1', type: 'corona' }],
          technicalInfo: { material: 'zirconio', color: 'A2', shade: 'standard' }
        }
      },
      {
        id: 'REQ-1765279544245',
        paziente: 'Verdi Giuseppe',
        dottore: 'Mario Russotto',
        tipo: '1 Elem. zirconio',
        data: '08/12/2024',
        stato: 'working',
        progress: 75,
        statusLabel: 'Colorazione',
        fullData: {
          id: 'REQ-1765279544245',
          nome: 'Giuseppe',
          cognome: 'Verdi',
          nomeDottore: 'Mario',
          cognomeDottore: 'Russotto',
          nomeStudio: 'Studio Russotto',
          elements: [{ number: '2.4', type: 'ponte' }],
          technicalInfo: { material: 'zirconio', color: 'B1', shade: 'custom' }
        }
      },
      // LAVORAZIONI PER DOTTORE DEFAULT (Mario Rossi)
      {
        id: 'REQ-1765100998877',
        paziente: 'Colombo Sara',
        dottore: 'Mario Rossi',
        tipo: '1 Elem. zirconio',
        data: '09/12/2024',
        stato: 'working',
        progress: 65,
        statusLabel: 'Cottura',
        fullData: {
          id: 'REQ-1765100998877',
          nome: 'Sara',
          cognome: 'Colombo',
          nomeDottore: 'Mario',
          cognomeDottore: 'Rossi',
          nomeStudio: 'Studio Odontoiatrico Albanese',
          elements: [{ number: '1.6', type: 'corona' }],
          technicalInfo: { material: 'zirconio', color: 'A1', shade: 'standard' }
        }
      },
      {
        id: 'REQ-1765001234567',
        paziente: 'Bianchi Luigi',
        dottore: 'Mario Rossi',
        tipo: '3 Elem. metallo ceramica',
        data: '05/12/2024',
        stato: 'warning',
        progress: 90,
        statusLabel: 'In Prova presso Studio',
        fullData: {
          id: 'REQ-1765001234567',
          nome: 'Luigi',
          cognome: 'Bianchi',
          nomeDottore: 'Mario',
          cognomeDottore: 'Rossi',
          nomeStudio: 'Studio Odontoiatrico Albanese',
          elements: [
            { number: '3.4', type: 'ponte' },
            { number: '3.5', type: 'ponte' },
            { number: '3.6', type: 'ponte' }
          ],
          technicalInfo: { material: 'metallo_ceramica', color: 'A3', shade: 'standard' }
        }
      },
      {
        id: 'REQ-1764988776655',
        paziente: 'Rossi Anna',
        dottore: 'Mario Rossi',
        tipo: '2 Elem. disilicato',
        data: '01/12/2024',
        stato: 'completed',
        progress: 100,
        statusLabel: 'Consegnato',
        fullData: {
          id: 'REQ-1764988776655',
          nome: 'Anna',
          cognome: 'Rossi',
          nomeDottore: 'Mario',
          cognomeDottore: 'Rossi',
          nomeStudio: 'Studio Odontoiatrico Albanese',
          elements: [
            { number: '1.1', type: 'corona' },
            { number: '1.2', type: 'corona' }
          ],
          technicalInfo: { material: 'disilicato', color: 'A1', shade: 'high_translucency' }
        }
      },
      {
        id: 'REQ-1764900112233',
        paziente: 'Ferrari Marco',
        dottore: 'Mario Rossi',
        tipo: '1 Elem. zirconio',
        data: '28/11/2024',
        stato: 'completed',
        progress: 100,
        statusLabel: 'Consegnato',
        fullData: {
          id: 'REQ-1764900112233',
          nome: 'Marco',
          cognome: 'Ferrari',
          nomeDottore: 'Mario',
          cognomeDottore: 'Rossi',
          nomeStudio: 'Studio Odontoiatrico Albanese',
          elements: [{ number: '4.6', type: 'corona' }],
          technicalInfo: { material: 'zirconio', color: 'A2', shade: 'standard' }
        }
      }
    ];

    localStorage.setItem('mimesi_all_lavorazioni', JSON.stringify(mockLavorazioni));
    console.log('✅ Mock lavorazioni initialized');
  }

  // Initialize Doctor Inbox if empty
  if (!existingDoctorInbox || JSON.parse(existingDoctorInbox).length === 0) {
    const mockDoctorInbox = [
      {
        id: Date.now() - 100000,
        from: 'Amministrazione',
        subject: 'Preventivo Pronto: Luigi Bianchi',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 giorno fa
        read: false,
        type: 'quote',
        fullData: {
          id: 'REQ-1765001234567',
          nome: 'Luigi',
          cognome: 'Bianchi',
          nomeDottore: 'Mario',
          cognomeDottore: 'Rossi',
          nomeStudio: 'Studio Odontoiatrico Albanese',
          elements: [
            { number: '3.4', type: 'ponte' },
            { number: '3.5', type: 'ponte' },
            { number: '3.6', type: 'ponte' }
          ],
          technicalInfo: { material: 'metallo_ceramica', color: 'A3', shade: 'standard' },
          quote: {
            subtotal: 368.85,
            vat: 81.15,
            total: 450.00
          }
        }
      },
      {
        id: Date.now() - 200000,
        from: 'Reparto CAD',
        subject: 'Lavorazione Avviata: Sara Colombo',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 giorni fa
        read: true,
        type: 'update'
      },
      {
        id: Date.now() - 300000,
        from: 'Amministrazione',
        subject: 'Consegna Completata: Anna Rossi',
        date: new Date(Date.now() - 259200000).toISOString(), // 3 giorni fa
        read: true,
        type: 'update'
      }
    ];

    localStorage.setItem('mimesi_doctor_inbox', JSON.stringify(mockDoctorInbox));
    console.log('✅ Mock doctor inbox initialized');
  }

  // Initialize Admin Inbox if empty
  if (!existingAdminInbox || JSON.parse(existingAdminInbox).length === 0) {
    const mockAdminInbox = [
      {
        id: Date.now() - 50000,
        from: 'Dr. Beppe Bergomi',
        subject: 'Nuova Prescrizione: Gigante Davide',
        date: new Date().toISOString(),
        read: false,
        type: 'request',
        fullData: {
          id: 'REQ-1765268339619',
          nome: 'Davide',
          cognome: 'Gigante',
          nomeDottore: 'Beppe',
          cognomeDottore: 'Bergomi',
          nomeStudio: 'Studio Bergomi',
          dataNascita: '1985-03-15',
          elements: [{ number: '1.1', type: 'corona' }],
          technicalInfo: {
            material: 'zirconio',
            color: 'A2',
            shade: 'standard',
            scanType: 'digital',
            urgency: 'normale'
          },
          filesMetadata: []
        }
      }
    ];

    localStorage.setItem('mimesi_admin_inbox', JSON.stringify(mockAdminInbox));
    console.log('✅ Mock admin inbox initialized');
  }
};