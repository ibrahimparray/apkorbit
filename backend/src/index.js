app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
