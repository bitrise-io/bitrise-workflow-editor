class ServeRoot

	def initialize(app)
		@app = app
	end

	def call(env)
		status, headers, response = @app.call(env)

		if status == 404
			env["PATH_INFO"] = "/"
			status, headers, response = @app.call(env)
		end

		[status, headers, response]
	end
end