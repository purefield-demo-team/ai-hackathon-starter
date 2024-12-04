1. cd to gitops/rhbk
2. First perform the pre-requisites that are described in the pre-requisites.txt:
	1. **openssl req -subj '/CN=keycloak-{namespace}.apps.{clustername}.{clusterdomain}/O=Test Keycloak./C=US' -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem**
	2. Before running the command above, you will replace the values inside the curly braces. For example: openssl req -subj '/CN=keycloak-restore-db-test.apps.salamander.aimlworkbench.com/O=Test Keycloak./C=US' -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem
	3. **oc create secret tls keycloak-tls-secret --cert certificate.pem --key key.pem**
	4. (OPTIONAL) [You could also use a let’s encrypt certificate if you enabled Certificate generation in the cluster](https://stephennimmo.com/2024/05/15/generating-lets-encrypt-certificates-with-red-hat-openshift-cert-manager-operator-using-the-cloudflare-dns-solver/)
3. There are two helm charts that must be run in the order described below. The database must be restored before instantiating the keycloak instance
4. cd to gitops/rhbk/keycloak-postgresql-chart
5. In the values.yaml file update the cluster name and domain values to match your cluster’s values. Keep everything else the same in the values.yaml file. You will be restoring a database that needs to match the other values in the file
6. Run **helm install keycloak-postgresql .**
7. ![[image39.png]]
8. Use pgAdmin-4 to restore the keycloak.backup file in the gitops/rhbk folder
9. **oc port-forward svc/keycloak-postgresql 5432**
10. ![[image8.png]]
11. Add the keycloak postgresql connection - **You must use the postgres admin user**
12. ![[image44.png]]
13. You will find the postgres admin password in the values.yaml file in /gitops/rhbk/keycloak-postgresql-chart/values.yaml
14. ![[image26.png]]
15. ![[image32.png]]
16. Once connected, right click on the “keycloak” database and select “restore”
17. ![[image49.png]]
18. Select the keycloak.backup file from gitops/rhbk/keycloak.backup
19. ![[image24.png]]
20. Click “Restore”
21. You should see a green “Finished”
22. ![[image13.png]]
23. cd to gitops/rhbk/keycloak-chart
24. Run **helm install keycloak .**
25. ![[image15.png]]
26. Because you restored an existing keycloak database, the admin password to login to the Admin UI is mentioned in the pre-requisite.txt file. You won’t be able to use the auto generated password in OpenShift secrets. The password in pre-requisites.txt is: **5cedc6c2e7474ea8b87b4cf0bcdd7812**
27. You can log into the Keycloak Admin UI from the route created to verify the client from the restored database exists:
28. ![[image21.png]]
29. ![[image38.png]]
30. ![[image4.png]]
31. If the “RAG AI Starter” Realm exists, you have installed Keycloak successfully