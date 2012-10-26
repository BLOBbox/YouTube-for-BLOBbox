try 
{
	TVB.log('Youtube: Loading languages');

	var languageCode = TVB.system.getLanguageCode();
	if (languageCode === false) 
	{
		languageCode = 'it';
	}

	TVB.log('Youtube: current language: ' + languageCode);

	var locales = {};

	locales.titlepiuvisti = 'I video pi&ugrave; visti';
	locales.titlepiuvotati = 'I video pi&ugrave; votati';
	locales.titlepiupopolari = 'I video pi&ugrave; popolari';
	locales.titlemieplaylist = "Le mie playlist";
	locales.titlemieipreferiti = "I miei video preferiti";
	locales.titlemieivideo = "I miei video";
	locales.titlemieicanali = "Le mie iscrizioni";
	locales.menupiuvisti = 'Pi&ugrave; visti';
	locales.menupiuvotati = 'Pi&ugrave; votati';
	locales.menupiupopolari = 'Popolari';
	locales.menumyyoutube = "Mio YouTube";
	locales.menucerca = "Cerca";
	locales.menuopzioni = "Opzioni";
	locales.menumieplaylist = "Le mie playlist";
	locales.menumieipreferiti = "I miei preferiti";
	locales.menumieivideo = "I miei video";
	locales.menumieicanali = "Le mie iscrizioni";
	locales.menuesci = "Esci";
	locales.menulogin = "Accedi";
	locales.menupreferenze = "Preferenze";
	locales.logintitle = "Accedi con il tuo account di YouTube";
	locales.logintext = "Accedi a YouTube su BLOBbox con il tuo account YouTube oppure con il tuo account Google, potrai<br/>vedere i tuoi preferiti e le tue playlist.";
	locales.mieultimericerche = "Le mie ultime ricerche";
	locales.haicercato = "Hai cercato";
	locales.opzionititle = "Opzioni di YouTube";
	locales.opzionitema = "Tema grafico";
	locales.opzionitext = "Cambia l'opzione \"Lingua dei risultati\" per scegliere la lingua dei risultati delle ricerche. Cambia l'opzione \"Tema grafico\" per cambiare la veste grafica dell'applicazione.<br/>Se cambi la grafica l'applicazione verr&agrave; ricaricata.";
	locales.opzionilingua = "Lingua dei risultati";
	locales.opzioniqualita = "Qualit&agrave; dei video";
	locales.save = "Salva";
	locales.nessunaplaylist = "Non hai mai creato alcuna playlist.";
	locales.nessunfavorito = "Non hai indicato alcun video come preferito.";
	locales.nessunmiovideo = "Non hai caricato alcun video.";
	locales.nessunmiocanale = "Non sei iscritto a nessun canale.";
	locales.oggi = "Oggi";
	locales.mese = "Mese";
	locales.settimana = "Settimana";
	locales.sempre = "Sempre";
	locales.videorimosso = "video rimosso";
	locales.videodi = "Video di ";
	locales.canaledi = "Il canale di %USERNAME%";
	locales.errornoplay = "Non posso riprodurre questo video";
	locales.alta = "Alta";
	locales.bassa = "Bassa";
	locales.riavvio = "L'applicazione verr&agrave; riavviata tra qualche secondo";
	locales.temachiaro = 'Chiaro';
	locales.temascuro = 'Scuro';

	switch (languageCode) {
		case 'en':
			locales.titlepiuvisti = 'Most viewed videos';
			locales.titlepiuvotati = 'Top rated videos';
			locales.titlepiupopolari = 'Most popular videos';
			locales.titlemieplaylist = "My playlists";
			locales.titlemieipreferiti = "My favorite videos";
			locales.titlemieivideo = "My videos";
			locales.titlemieicanali = "My channels";
			locales.menupiuvisti = 'Most viewed';
			locales.menupiuvotati = 'Top rated';
			locales.menupiupopolari = 'Most popular';
			locales.menumyyoutube = "My YouTube";
			locales.menucerca = "Search";
			locales.menuopzioni = "Options";
			locales.menumieplaylist = "My playlists";
			locales.menumieipreferiti = "My favorites";
			locales.menumieivideo = "My videos";
			locales.menumieicanali = "My channels";
			locales.menuesci = "Exit";
			locales.menulogin = "Login";
			locales.menupreferenze = "Preferences";
			locales.logintitle = "Log in with your YouTube account";
			locales.logintext = "Log in with your YouTube account or with your Google account, you will be able to see your favorites and handle your playlists.";
			locales.mieultimericerche = "My last searches";
			locales.haicercato = "You searched for";
			locales.opzionititle = "YouTube options";
			locales.opzionitext = "Change the region to choose the language of search results.";
			locales.opzionitema = "Graphic skin";
			locales.opzionilingua = "Language for results";
			locales.opzioniqualita = "Video quality";
			locales.save = "Save";
			locales.nessunaplaylist = "You have no playlists.";
			locales.nessunfavorito = "You haven't marked any video as favorite.";
			locales.nessunmiovideo = "You haven't uploaded any video.";
			locales.nessunmiocanale = "You haven't subscribed to any channel.";
			locales.oggi = "Today";
			locales.mese = "This month";
			locales.settimana = "This week";
			locales.sempre = "All time";
			locales.videorimosso = "removed";
			locales.videodi = "Videos published by";
			locales.canaledi = "%USERNAME%'s channel";
			locales.errornoplay = "Can't play this video";
			locales.alta = "High";
			locales.bassa = "Low";
			locales.riavvio = "The application will restart shortly.";
			locales.temachiaro = 'Bright';
			locales.temascuro = 'Dark';

			break;
	}
} 
catch (e) 
{
	TVB.exception(e);
}

