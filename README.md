# Solid index

The Express, Node.js, TypeScript, MySQL based server for indexing specific relationships on Solid Pods. This way it is possible to find indexed people by these specific relationships.

Right now it's hardcoded to index triples

```
(Person) [is interested in] (Something)
```

where `(Person)` is a person (uri) of type `foaf:Person`,
`[is interested in]` is predicate `foaf:topic_interest`,
and `(Something)` is an uri representing anything, typically wikidata entity

```
(Dit) [has topic] (Something)
```

where `(Dit)` is of type `https://ditup.example/#Idea` or `https://ditup.example/#Problem`,
`[has topic]` is predicate `as:tag`,
and `(Something)` is same as above

## Usage

### Database

You need to have MySQL (or MariaDB) installed on your machine
Create a mysql database.

```mysql
CREATE DATABASE your_new_database_name;
```

For added security, create a separate database user, and grant them all rights to this database. You can use your root account instead, but that's not as safe. If your password leaks, you're exposing all your mysql databases

```mysql
CREATE USER 'your_new_username'@'localhost' IDENTIFIED BY 'your_preferably_secure_password';
GRANT ALL PRIVILEGES TO 'your_new_username'@'localhost' ON 'your_new_database_name'.*;
FLUSH PRIVILEGES;
```

### Preparation

#### Clone and install

```shell
git clone https://github.com/ditup/solid-index.git
cd solid-index/
yarn # or npm install
```

#### Configure

```shell
cp .env.sample to dev.env
```

And edit dev.env with your database connection info

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_new_username
DB_PASSWORD=your_preferably_secure_password
DB_DATABASE=your_new_database_name

```

### Start and Usage

```shell
yarn start
# or npm start
```

Now, you can send `POST http://localhost:3000/inbox`

with header `content-type:application/ld+json;profile="https://www.w3.org/ns/activitystreams"`

and body

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "@id": "",
  "@type": "Announce",
  "actor": "[your Solid identity uri]",
  "object": "[(Person) or (Dit)]***"
}
```

_\*\*\* (Person) or (Dit) should be your Solid identity uri, or uri of something you created and wish to add to the index_

(This request tries to follow [Linked Data Notifications](https://www.w3.org/TR/ldn/#sender) specification, but does so only lousily at this point.)

If all goes well, you should receive response `202 Accepted`. That means that your desire to index `object` has been saved, and it will soon be processed and become discoverable.

This index only processes profiles and items that are public.

_In the future, it will be possible to withdraw profiles and things from the index, however it doesn't work now. (We'll need to include Solid-OIDC authentication for that.)_

### Configure LDF server

You're supposed to run [Linked Data Fragments](https://github.com/LinkedDataFragments/Server.js) server on top of this database. TODO and repository coming soon...

### Run in Production

This project is in an early alpha state. Use at your own risk.

We run it [in production](https://index.ditup.org/inbox), with [LDF server](https://index.ditup.org/ldf) serving the data, with pm2 and Nginx. Documentation shall be added.

### Notes to self

- you need to authenticate
- to authenticate, the profile needs to contain `me: solid:oidcIssuer <issuer url e.g. https://solidcommunity.net>.`

## License

[MIT](./LICENSE)
