export async function getPumpFunNameByAddress(address: string) {
	const request = await fetch('https://frontend-api.pump.fun/coins/' + address).catch(() => null);
	if (!request) return 'Unknown';

	const json = await request.json();

	return json && `${json.name} (${json.symbol})`;
}

export async function getTokenNameByAddress(address: string, isEthereum = false) {
	if (!isEthereum) return getPumpFunNameByAddress(address);

	const request = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + address).catch(() => null);
	if (!request) return 'Unknown';

	const json = await request.json();
	const firstPair = json?.pairs?.[0];

	return firstPair && `${firstPair.baseToken?.name} (${firstPair.baseToken?.symbol})`;
}
