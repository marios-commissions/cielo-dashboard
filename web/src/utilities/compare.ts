function compare(current: Record<any, any>, previous: Record<any, any>) {
	for (const key in current) {
		if (current[key] !== previous[key]) {
			return true;
		}
	}

	return false;
}

export default compare;