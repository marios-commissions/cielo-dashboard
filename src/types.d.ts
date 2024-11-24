interface TransactionData {
	wallet: string;
	wallet_label: string;
	tx_hash: string;
	tx_type: string;
	chain: string;
	index: number;
	timestamp: number;
	block: number;
	dex: string;
	from: string;
	to: string;
	token0_address: string;
	token0_amount: number;
	token0_amount_usd: number;
	token0_price_usd: number;
	token0_name: string;
	token0_symbol: string;
	token0_icon_link: string;
	token1_address: string;
	token1_amount: number;
	token1_amount_usd: number;
	token1_price_usd: number;
	token1_name: string;
	token1_symbol: string;
	token1_icon_link: string;
	first_interaction: boolean;
	from_label: string;
	to_label: string;
}

interface Transaction {
	type: 'tx';
	data: TransactionData;
}

export type Entities = EntityUpdate[];

export type EntityUpdate = {
	buyer: string;
	date: number;
	tx: string;
};