const llmParser = (message) => {
    // Move code blocks to the next line
    const codeBlockMoved = message.replace(/\\n(```[^`]+```)/g, '\n\n$1');
  
    // If it's a list, move the digit or letter followed by a dot to the next line
    const markdownText = codeBlockMoved.replace(/\\n(\d+\.[^\n]+|[a-zA-Z]\.[^\n]+)/g, '\n$1');
  
    return markdownText;
  };
  
  // Example usage
  const message = `
  Suspension of opposition MPs: Fifteen Indian opposition MPs have been suspended after protesting against a security breach in parliament on Wednesday.\n2. Arrest of intruders: At least four people were arrested after two intruders shouted slogans and set off coloured smoke inside parliament. Their motive remains unclear.\n3. Security investigation: The federal home ministry has ordered an investigation into the incident.\n4. Anniversary of deadly attack: The security lapse occurred on the 22nd anniversary of a deadly attack on the parliament in 2001.\n5. Suspension of MP Derek O'Brien: Opposition MP Derek O'Brien was suspended forignoble conduct after shouting slogans demanding a statement from Home Minister Amit Shah.\n6. Suspension of other opposition MPs: In the Lok Sabha, 14 MPs from opposition parties such as the Congress and the Dravida Munnetra Kazhagam were suspended until 22 December.\n7. Defense minister Rajnath Singh's statement: Before the session was adjourned, defense minister Rajnath Singh said in parliament that the incident had been condemned byeveryone\n8. Demand for action against Pratap Simha: Opposition leaders have demanded action against Pratap Simha, an MP from the governing Bharatiya Janata Party (BJP) who allegedly signed the passes used by the intruders to enter the public gallery in parliament.\n9. Visitor passes suspended: Police have not officially confirmed the identities yet, but their families have been speaking to local media and newspapers have published their photos and names. Visitor passes have been suspended until a security review is completed for the parliament building.
  `;
  
  const parsedMessage = llmParser(message);
  console.log(parsedMessage);
  