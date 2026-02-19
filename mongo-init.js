const appDbName = process.env.MONGO_INITDB_DATABASE || "gold-bars";
const appUser = process.env.MONGO_APP_USER || "app_user";
const appPassword = process.env.MONGO_APP_PASSWORD;

if (!appPassword) {
  throw new Error("MONGO_APP_PASSWORD is required to create the app user.");
}

db.getSiblingDB(appDbName).createUser({
  user: appUser,
  pwd: appPassword,
  roles: [{ role: "readWrite", db: appDbName }],
});
