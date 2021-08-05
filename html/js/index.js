if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

if (!String.prototype.escapedHtml) {
  String.prototype.escapedHtml = function() {
	  var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	  };
	  return this.replace(/[&<>"']/g, function(m) { return map[m]; });
	};
}

if (!String.prototype.cleanPhoneNumber) {
  String.prototype.cleanPhoneNumber = function() {
	  var map = {
		' ': '',
		'-': '',
		'/': '',
		'(': '',
		")": ''
	  };
	  string = this.replace('(0)', '');
	  return string.replace(/[ \-\/\(\)]/g, function(m) { return map[m]; });
	};
}


function UIAction(app, callback, data = null) {

    this.app = app;
    this.callback = callback;
    this.data = data;

    this.execute = function() {
        this.app.ui_action_in_progress = this;
        this.callback(this);
    };

    this.finish = function() {
		app = this.app;
        app.ui_action_in_progress = null;
		setTimeout(function(){ app.main_loop_interval(); }, 20);
    }
};

function ActionStack(app) {

    this.app = app;
    this.array = [];

    this.push = function(action_object) {
		app = this.app;
        this.array.push(action_object);
		setTimeout(function(){ app.main_loop_interval(); }, 20);
    }

    this.shift = function() {
        return this.array.shift();
    }
	
	this.count = function() {
		return this.array.length;
	}
}


function Application() {

    // Initialisation
	
    this.ui_action_stack = new ActionStack(this);
    this.ui_action_in_progress = null;
    this.ui_active_page = null;
	this.ui_active_btn = null;
	
	this.data = {};
	this.office_vcard = '';
	this.xmpp_link_office = '';
	this.home_vcard = '';
	this.blob_to_share = null;

    // Methods

	this.switch_pages = function(action) {
		app = action.app;
		btn_id = action.data['btn_id'];
		page_id = action.data['page_id'];
		setTimeout(function() {
			// Fade out active page
			app.ui_active_page.classList.add('invisible_page');
			// Switch to new active button
			app.ui_active_btn.classList.remove('selected_btn');
			app.ui_active_btn = document.getElementById(btn_id);
			app.ui_active_btn.classList.add('selected_btn');
		}, 20);
		setTimeout(function() {
			// Switch to new active page
			app.ui_active_page.classList.add('hidden_page');
			app.ui_active_page = document.getElementById(page_id);
			app.ui_active_page.classList.remove('hidden_page');
		}, 540);
		setTimeout(function() {
			// Switch to new active page
			app.ui_active_page.classList.remove('invisible_page');
		}, 560);
		setTimeout(function() {
			// Finish up
			action.finish();
		}, 1080);
	};

	this.update_office_page = function() {
		app = this;
		app.office_vcard = 'BEGIN:VCARD' + "\n";
		app.office_vcard += 'VERSION:3.0' + "\n";
		display = document.getElementById('vcard_text_office');
		display.innerHTML = '';
		
		org_text = app.data['office_org'].trim();
		if (org_text.length > 0) {
			org_p = document.createElement('p');
			org_p.className = 'org';
			org_p.innerHTML = org_text.escapedHtml();
			display.appendChild(org_p);
			app.office_vcard += 'ORG:'+ org_text + "\n";
		}
		fn_text = app.data['office_fn'].trim();
		ln_text = app.data['office_ln'].trim();
		if ((fn_text.length > 0) || ((ln_text.length > 0))) {
			fn_p = document.createElement('p');
			fn_p.className = 'fn';
			fn_p.innerHTML = fn_text.escapedHtml() + " " + ln_text.escapedHtml();
			display.appendChild(fn_p);
			app.office_vcard += 'N;CHARSET=UTF-8:'+ ln_text + ';' + fn_text + ';;;' + "\n";
		}
		role_text = app.data['office_role'].trim();
		if (role_text.length > 0) {
			role_p = document.createElement('p');
			role_p.className = 'role';
			role_p.innerHTML = role_text.escapedHtml();
			display.appendChild(role_p);
			app.office_vcard += 'TITLE;CHARSET=UTF-8:'+ role_text + "\n";
		}
		addr_text = app.data['office_addr'].trim();
		if (addr_text.length > 0) {
			addr_p = document.createElement('p');
			addr_p.className = 'address';
			addr_p.innerHTML = addr_text.escapedHtml();
			display.appendChild(addr_p);
		}
		zip_text = app.data['office_zip'].trim();
		city_text = app.data['office_city'].trim();
		if ((zip_text.length > 0) || (city_text.length > 0)) {
			zip_city_p = document.createElement('p');
			zip_city_p.className = 'address';
			zip_city_p.innerHTML = (zip_text.escapedHtml() + ' ' + city_text.escapedHtml());
			display.appendChild(zip_city_p);
		}
		if ((zip_text.length > 0) || (zip_text.length > 0) || (city_text.length > 0)) {
			app.office_vcard += 'ADR;CHARSET=UTF-8;TYPE=WORK:;;' + addr_text + ';' + city_text + ';;'+ zip_text + ';Germany' + "\n";
		}
		tel0_text = app.data['office_tel0'].trim();
		if (tel0_text.length > 0) {
			tel0_p = document.createElement('p');
			tel0_p.className = 'tel0';
			tel0_p.innerHTML = ' ' + tel0_text.escapedHtml();
			display.appendChild(tel0_p);
			phone_icon = document.createElement('img');
			phone_icon.alt = 'Telefon';
			phone_icon.className = 'text';
			phone_icon.src = 'img/phone.svg';
			tel0_p.prepend(phone_icon);
			app.office_vcard += 'TEL;TYPE=WORK,VOICE:'+ tel0_text.cleanPhoneNumber() + "\n";
		}
		email_text = app.data['office_email'].trim();
		if (email_text.length > 0) {
			email_p = document.createElement('p');
			email_p.className = 'email';
			email_p.innerHTML = ' ' + email_text.escapedHtml();
			display.appendChild(email_p);
			email_icon = document.createElement('img');
			email_icon.alt = 'E-Mail';
			email_icon.className = 'text';
			email_icon.src = 'img/mail.svg';
			email_p.prepend(email_icon);
		    email_text = email_text.replace(' ','');
			app.office_vcard += 'EMAIL;TYPE=WORK:'+ email_text + "\n";
		}
		web_text = app.data['office_web'].trim();
		if (web_text.length > 0) {
			web_p = document.createElement('p');
			web_p.className = 'web';
			web_p.innerHTML = ' ' + web_text.escapedHtml();
			display.appendChild(web_p);
			web_icon = document.createElement('img');
			web_icon.alt = 'Website';
			web_icon.className = 'text';
			web_icon.src = 'img/web.svg';
			web_p.prepend(web_icon);
		    web_text = web_text.replace(' ','');
			app.office_vcard += 'URL;TYPE=WORK:http://'+ web_text +"\n";
		}
		app.office_vcard += "END:VCARD";
		console.log(app.office_vcard);
		qrcode = new QRCode({ msg: app.office_vcard , ecl: 'L'});
		document.getElementById('qrcode_office').appendChild(qrcode);
		qrcode.setAttribute("width", "100%");
		qrcode.setAttribute("height", "100%");
	};
	
	this.update_xmpp_office_page = function() {
		app = this;
		app.xmpp_link_office = '';
		display = document.getElementById('xmpp_text_office');
		display.innerHTML = '';
		
		xmpp_frame = document.createElement('div');
		xmpp_frame.className = 'xmpp_frame';
		display.appendChild(xmpp_frame);
		
		xmpp_icon = document.createElement('img');
		xmpp_icon.className = 'xmpp_logo';
		xmpp_icon.src = 'img/xmpp-chat.svg';
		xmpp_frame.appendChild(xmpp_icon);
		
		xmpp_office = app.data['xmpp_office'].trim();
		if (xmpp_office.length > 0) {
			xmpp_id_p = document.createElement('p');
			xmpp_id_p.className = 'xmpp_id';
			xmpp_escaped_text = xmpp_office.escapedHtml();
			xmpp_id_p.innerHTML = xmpp_escaped_text.replace('@chat.humboldt-institut.org', '@chat<span class="red">.</span>humboldt-institut.org');
			xmpp_frame.appendChild(xmpp_id_p);

			app.xmpp_link_office = 'xmpp:' + xmpp_office;
		}
		console.log(app.xmpp_link_office);
		qrcode = new QRCode({ msg: app.xmpp_link_office , ecl: 'L'});
		document.getElementById('xmpp_qrcode_office').appendChild(qrcode);
		qrcode.setAttribute("width", "100%");
		qrcode.setAttribute("height", "100%");
	};

	this.update_home_page = function() {
		app = this;
		app.home_vcard = 'BEGIN:VCARD' + "\n";
		app.home_vcard += 'VERSION:3.0' + "\n";
		display = document.getElementById('vcard_text_home');
		display.innerHTML = '';
	
		fn_text = app.data['home_fn'].trim();
		ln_text = app.data['home_ln'].trim();
		if ((fn_text.length > 0) || ((ln_text.length > 0))) {
			fn_p = document.createElement('p');
			fn_p.className = 'fn_priv';
			fn_p.innerHTML = fn_text.escapedHtml() + " " + ln_text.escapedHtml();
			display.appendChild(fn_p);
			app.home_vcard += 'N;CHARSET=UTF-8:'+ ln_text + ';' + fn_text + ';;;' + "\n";
		}
		addr_text = app.data['home_addr'].trim();
		if (addr_text.length > 0) {
			addr_p = document.createElement('p');
			addr_p.className = 'address';
			addr_p.innerHTML = addr_text.escapedHtml();
			display.appendChild(addr_p);
		}
		zip_text = app.data['home_zip'].trim();
		city_text = app.data['home_city'].trim();
		if ((zip_text.length > 0) || (city_text.length > 0)) {
			zip_city_p = document.createElement('p');
			zip_city_p.className = 'address';
			zip_city_p.innerHTML = (zip_text.escapedHtml() + ' ' + city_text.escapedHtml());
			display.appendChild(zip_city_p);
		}
		if ((zip_text.length > 0) || (zip_text.length > 0) || (city_text.length > 0)) {
			app.home_vcard += 'ADR;CHARSET=UTF-8;TYPE=HOME:;;' + addr_text + ';' + city_text + ';;'+ zip_text + ';Germany' + "\n";
		}
		tel0_text = app.data['home_tel0'].trim();
		if (tel0_text.length > 0) {
			tel0_p = document.createElement('p');
			tel0_p.className = 'tel0';
			next_tel_class = 'tel1';
			tel0_p.innerHTML = ' ' + tel0_text.escapedHtml();
			display.appendChild(tel0_p);
			phone_icon = document.createElement('img');
			phone_icon.alt = 'Telefon';
			phone_icon.className = 'text';
			phone_icon.src = 'img/phone.svg';
			tel0_p.prepend(phone_icon);
			app.home_vcard += 'TEL;TYPE=HOME,VOICE:'+ tel0_text.cleanPhoneNumber() + "\n";
		}
		else {
			next_tel_class = 'tel0';
		}
		tel1_text = app.data['home_tel1'].trim();
		if (tel1_text.length > 0) {
			tel1_p = document.createElement('p');
			tel1_p.className = next_tel_class;
			tel1_p.innerHTML = ' ' + tel1_text.escapedHtml();
			display.appendChild(tel1_p);
			mobile_icon = document.createElement('img');
			mobile_icon.alt = 'Mobiltelefon';
			mobile_icon.className = 'text';
			mobile_icon.src = 'img/mobile.svg';
			tel1_p.prepend(mobile_icon);
			app.home_vcard += 'TEL;TYPE=HOME,CELL:'+ tel1_text.cleanPhoneNumber() + "\n";
		}
		email_text = app.data['home_email'].trim();
		if (email_text.length > 0) {
			email_p = document.createElement('p');
			email_p.className = 'email';
			email_p.innerHTML = ' ' + email_text.escapedHtml();
			display.appendChild(email_p);
			email_icon = document.createElement('img');
			email_icon.alt = 'E-Mail';
			email_icon.className = 'text';
			email_icon.src = 'img/mail.svg';
			email_p.prepend(email_icon);
		    email_text = email_text.replace(' ','');
			app.home_vcard += 'EMAIL;TYPE=HOME:'+ email_text + "\n";
		}
		web_text = app.data['home_web'].trim();
		if (web_text.length > 0) {
			web_p = document.createElement('p');
			web_p.className = 'web';
			web_p.innerHTML = ' ' + web_text.escapedHtml();
			display.appendChild(web_p);
			web_icon = document.createElement('img');
			web_icon.alt = 'Website';
			web_icon.className = 'text';
			web_icon.src = 'img/web.svg';
			web_p.prepend(web_icon);
        	web_text = web_text.replace(' ','');
			app.home_vcard += 'URL;TYPE=HOME:http://'+ web_text +"\n";
		}
		app.home_vcard += "END:VCARD";
		console.log(app.home_vcard);
		qrcode = new QRCode({ msg: app.home_vcard , ecl: 'L'});
		document.getElementById('qrcode_home').appendChild(qrcode);
		qrcode.setAttribute("width", "100%");
		qrcode.setAttribute("height", "100%");
	};

    // Input events

	this.click_office_btn = function(e) {
		action = new UIAction(app, app.switch_pages, data = {'btn_id': 'office_btn', 'page_id':'office_page'});
		app.ui_action_stack.push(action);
	};
	this.click_home_btn = function(e) {
		action = new UIAction(app, app.switch_pages, data = {'btn_id': 'home_btn', 'page_id':'home_page'});
		app.ui_action_stack.push(action);
	};
	this.click_xmpp_office_btn = function(e) {
		action = new UIAction(app, app.switch_pages, data = {'btn_id': 'xmpp_office_btn', 'page_id':'xmpp_office_page'});
		app.ui_action_stack.push(action);
	};
	this.click_share_btn = function(e) {
		app.blob_to_share = new Blob([app.office_vcard], {type: 'text/directory;charset="utf-8";profile="vCard"'});
		url_to_share = URL.createObjectURL(app.blob_to_share);
		console.log(url_to_share);

		filesArray = [app.blob_to_share];
		navigator.share({
			files: filesArray,
			title: 'Visitenkarte',
			text: 'Kontaktdaten für ihr Adressbuch'
		})
		.then(() => console.log('Share was successful.'))
		.catch((error) => console.log('Sharing failed', error));
	};
	this.click_edit_btn = function(e) {
		action = new UIAction(app, app.switch_pages, data = {'btn_id': 'edit_btn', 'page_id':'edit_page'});
		app.ui_action_stack.push(action);
	};
	
	this.change_office_input = function(e) {
		app.data[e.target.name] = e.target.value;
		window.localStorage.setItem(e.target.name, e.target.value);
		app.update_office_page();
	};
	
	this.change_xmpp_office_input = function(e) {
		app.data[e.target.name] = e.target.value;
		window.localStorage.setItem(e.target.name, e.target.value);
		app.update_xmpp_office_page();
	};
	
	this.change_home_input = function(e) {
		app.data[e.target.name] = e.target.value ? e.target.value : '';
		window.localStorage.setItem(e.target.name, e.target.value);
		app.update_home_page();
	};

    // Genaral

    this.main_loop_interval = function() {

        while ((app.ui_action_in_progress == null) && app.ui_action_stack.count() > 0) {
            next_action = app.ui_action_stack.shift();
            next_action.execute();
        }
    };

    this.run = function() {
		app = this;
		
		storage = window.localStorage;
		
		app.data['office_org'] = (storage.office_org) ? storage.office_org : 'Musterfirma GmbH';
		app.data['office_fn'] = (storage.office_fn) ? storage.office_fn : 'Max';
		app.data['office_ln'] = (storage.office_ln) ? storage.office_ln : 'Mustermann';
		app.data['office_role'] =  (storage.office_role) ? storage.office_role : 'Mitarbeiter';
		app.data['office_addr'] =  (storage.office_addr) ? storage.office_addr : 'Mustergasse 1';
		app.data['office_zip'] =  (storage.office_zip) ? storage.office_zip : '12345';
		app.data['office_city'] =  (storage.office_city) ? storage.office_city : 'Musterhausen';
		app.data['office_tel0'] =  (storage.office_tel0) ? storage.office_tel0 : '+49 1234 / 567890';
		app.data['office_email'] =  (storage.office_email) ? storage.office_email : 'mustermann@musterfirma.de';
		app.data['office_web'] =  (storage.office_web) ? storage.office_web : 'www.musterfirma.de';
		app.update_office_page();
		
		app.data['xmpp_office'] =  (storage.xmpp_office) ? storage.xmpp_office : 'freie-messenger@conference.jabber.de?join';
		app.update_xmpp_office_page();
		
		app.data['home_fn'] = (storage.home_fn) ? storage.home_fn : 'Max';
		app.data['home_ln'] = (storage.home_ln) ? storage.home_ln : 'Mustermann';
		app.data['home_addr'] =  (storage.home_addr) ? storage.home_addr : 'Mustergasse 3';
		app.data['home_zip'] =  (storage.home_zip) ? storage.home_zip : '12345';
		app.data['home_city'] =  (storage.home_city) ? storage.home_city : 'Musterhausen';
		app.data['home_tel0'] =  (storage.home_tel0) ? storage.home_tel0 : '+49 1234 / 567890';
		app.data['home_tel1'] =  (storage.home_tel1) ? storage.home_tel1 : '';
		app.data['home_email'] =  (storage.home_email) ? storage.home_email : 'mustermann@musterprovider.de';
		app.data['home_web'] =  (storage.home_web) ? storage.home_web : '';
		app.update_home_page();

		e = document.getElementById('office_org_input');
		e.value = app.data['office_org'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_fn_input');
		e.value = app.data['office_fn'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_ln_input');
		e.value = app.data['office_ln'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_role_input');
		e.value = app.data['office_role'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_addr_input');
		e.value = app.data['office_addr'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_zip_input');
		e.value = app.data['office_zip'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_city_input');
		e.value = app.data['office_city'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_tel0_input');
		e.value = app.data['office_tel0'].trim();
		e.onchange = app.change_office_input;
		e = document.getElementById('office_email_input');
		e.value = app.data['office_email'].trim();
		e.onchange = app.change_office_input;
		
		e = document.getElementById('xmpp_office_input');
		e.value = app.data['xmpp_office'].trim();
		e.onchange = app.change_xmpp_office_input;
		
		e = document.getElementById('home_fn_input');
		e.value = app.data['home_fn'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_ln_input');
		e.value = app.data['home_ln'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_addr_input');
		e.value = app.data['home_addr'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_zip_input');
		e.value = app.data['home_zip'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_city_input');
		e.value = app.data['home_city'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_tel0_input');
		e.value = app.data['home_tel0'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_tel1_input');
		e.value = app.data['home_tel1'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_email_input');
		e.value = app.data['home_email'].trim();
		e.onchange = app.change_home_input;
		e = document.getElementById('home_web_input');
		e.value = app.data['home_web'].trim();
		e.onchange = app.change_home_input;

		office_page = document.getElementById('office_page');
		app.ui_active_page = office_page;
		office_btn = document.getElementById('office_btn');
		office_btn.onclick = app.click_office_btn;
		office_btn.classList.add('selected_btn');
		app.ui_active_btn = office_btn;
		
		xmpp_office_page = document.getElementById('xmpp_office_page');
		xmpp_office_page.classList.add('invisible_page');
		xmpp_office_page.classList.add('hidden_page');
		xmpp_office_btn = document.getElementById('xmpp_office_btn');
		xmpp_office_btn.onclick = app.click_xmpp_office_btn;
		
		home_page = document.getElementById('home_page');
		home_page.classList.add('invisible_page');
		home_page.classList.add('hidden_page');
		home_btn = document.getElementById('home_btn');
		home_btn.onclick = app.click_home_btn;
		
		edit_page = document.getElementById('edit_page');
		edit_page.classList.add('invisible_page');
		edit_page.classList.add('hidden_page');
		
		edit_btn = document.getElementById('edit_btn');
		edit_btn.onclick = app.click_edit_btn;
		
		setTimeout(function(){ app.main_loop_interval(); }, 20);
    };

}
