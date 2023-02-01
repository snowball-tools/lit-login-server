import { createQueryParams, encode, decode, getStateParam, setStateParam, isAllowedProvider, removeStateParam } from './utils';

export class LitOAuthClient {
	domain;
	redirectUri;
	uiConfig;
	appState;

	constructor(domain, redirectUri, uiConfig) {
		this.domain = domain;
		this.redirectUri = redirectUri;
		this.uiConfig = uiConfig;
		this.appState = null;
	}

	loginWithRedirect() {
		// Get login url
		const loginUrl = this._prepareLoginUrl();
		// Redirect to login url
		window.location.assign(loginUrl);
	}
	
	async handleRedirectCallback() {
		// Check url for params
		const searchParams = new URLSearchParams(document.location.search);
		const provider = searchParams.get('provider');
	
		// Check if state param matches
		const state = searchParams.get('state');
		if (decode(decodeURIComponent(state)) !== getStateParam()) {
			throw new Error('Invalid state');
		}

		if (!isAllowedProvider(provider)) {
			throw new Error('Invalid provider');
		}
		
		// Handle Google OAuth
		if (provider === 'google') {
			const credential = searchParams.get('credential');
			this.appState = {
				provider: provider,
				credential: credential,
				state: getStateParam(),
			}
		}
	
		// Handle Discord OAuth
		if (provider === 'discord') {
			const access_token = searchParams.get('access_token');
			this.appState = {
				provider: provider,
				credential: access_token,
				state: getStateParam(),
			}
		}

		return this.appState;
	}

	clearAppState() {
		this.appState = null;
		removeStateParam();
	}

	_prepareLoginUrl() {
		const baseUrl = `${import.meta.env.VITE_LOGIN_ORIGIN}/login`;
		const state = encode(setStateParam());
		const params = {
			app_domain: this.domain,
			app_redirect: this.redirectUri,
		}
		const queryParams = createQueryParams(params);
		return `${baseUrl}?${queryParams}&state=${state}`;
	}
}