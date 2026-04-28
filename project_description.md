In this project I want to build a solution that helps a cleaning company to to assist with their daily operations.Following the are main requirements . Solution needs to be open for extention as new requirements immerge.

MVP Epics

1.Managers should be able to create sites in the web portal and assign employees for the sites.
- When assigning employees to site, location  should be searchable in a map ( google or open street map) , after finding a site should be able to assign a employee, if it is a new site , should be able to create a new site. 


3.
Before Employee start working in a site , he or she should able to press a button indicating that they have signed in for work, the employee is already is in the site and ready to begin the work. When work is done he should be able to sign off the with a click of a button.
- to start or end the job , employee should be at closer than a configurable distance. to this employee location data should be process in back end server. and thorough out the work inprogres, for a given interval employee gps locations should be able to send to back end and should be persisted. this data should be able to query later to make informed decessions.


The solutuon consists of following components.

1. Android and ios app => using Kotlin
2. Web admin pannel    => using React
3. back send services  => Go lang , microserverice + labda functions ,deploying in AWS










