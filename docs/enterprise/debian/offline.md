# Creating an Offline Repository

The `pgedge` repository provides packages that provide a simplified way to install pgEdge Enterprise Postgres and its supporting components.  You can use a copy of the repository to create an offline repository for use on systems with restricted internet access.

Creating an offline repository requires two systems:

* One system with internet access to download and create a *live* model of the repository. 

* One system with access to the machine with internet access; after creating the model on the first host, you will copy the repository to the system without internet access.

You must ensure that both systems have the same OS version and architecture. You can use the following commands to confirm that the version of Ubuntu and the architecture are the same on both hosts:

```bash
lsb_release -a
uname -m
```

On the system with online access, you will create a live model of the pgEdge repository.  Use the following commands to create a working directory and move into that directory:

```bash
mkdir -p ~/pgdge18-offline
cd ~/pg18-offline
```

Then, install prerequisite software and add the pgEdge APT repository:

```bash
apt-get update && apt-get install -y curl gnupg2 lsb-release
sudo apt-get install --download-only -y pgedge-enterprise-postgres-18
sudo cp /var/cache/apt/archives/*.deb ~/pg18-offline/
curl -sSL https://apt.pgedge.com/repodeb/pgedge-release_latest_all.deb -o /tmp/pgedge-release.deb && sudo dpkg -i /tmp/pgedge-release.deb && rm -f /tmp/pgedge-release.deb || true 
apt-get update
```

After creating the model of the repository on the temporary host, you can transfer the entire repo to the offline repository host.  For example:

`sudo cp /var/cache/apt/archives/*.deb ~/pg18-offline/`

After transferring the files, you can remove system hosting the offline repo from the network.  To use the repo, navigate into the folder that contains the repo and use the `apt-get install` command to specify the complete package name:

   `sudo apt-get install -y ./package_name.deb` 

Note that you can instead specify the complete path to the repo; for example, to install the pgEdge Enterprise Postgres package, use the command:

   `sudo apt-get install -y path-to-offline-repo/pgedge-enterprise-postgres-18.deb` 

Or, to install each pgEdge component individually, specify a component name; for example, to install pgAdmin, use the command:

   `sudo apt-get install -y path-to-offline-rep/pgedge-pgadmin4.deb` 

Additional system-specific steps are required to create an offline repository that does not require path-qualified installation commands and complete archive names; [review the official documentation](https://wiki.debian.org/DebianRepository) for more information.