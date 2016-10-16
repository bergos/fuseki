# fuseki

A Fuseki server wrapper and management API.
Java must be installed on the machine, everything else (including downloading the jar files) is done by `npm install`.

## Usage


### Constructor(Object options)

`options` can have the following properties:

- home: Path to Fuseki which will set as environment variable `FUSEKI_HOME` (default: ./fuseki)
- pipeOutput: Forward the output of Fuseki to `stdout` and `stderr` (default: false)

### Promise .start()

Starts the server.

### Promise .stop()

Stops the server.

### Promise .alive()

Checks if the server is alive.
This is done with a `GET` request to `/$/ping`.
The Promise is rejected if the server isn't alive.

### Promise .wait(timeout=10000)

Waits for the server to show up.
If the server doesn't respond until the given `timeout` the Promise will be rejected.

### Promise .datasets()

Returns the list of available datasets on the server.

### Promise .createDataset(name, type, filename, graph='default')

Creates a new datasets with the given `name`.
The `type` must be `tdb` for a persistent dataset or `mem` for in memory.
The dataset will be filled initially if `filename` is given.
The named graph given in `graph` will be used for the file upload.

### Promise .uploadDataset(name, filename, graph='default')

Will upload a file with the given `filename` to the dataset `name` to the named graph `graph`.
