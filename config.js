module.exports = {
	name: process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
	base_url: process.env.BASE_URL || 'http://localhost:8080',
	projectId: 'nexa-beyvqc',
	appCredentials: 'nexa-beyvqc-52fa3089d3b8.json',
};
