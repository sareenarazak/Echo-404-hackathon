Each table will have the following format:

<userName>Messages

For example, Joe will have his own dynamo DB table of messages:

joeMessages


In each table, each item will be a message and have the following format:

{
	id			: <hash value>,
	sender		: <sender name>,
	time 		: <time stamp>,
	message 	: <the message>
}