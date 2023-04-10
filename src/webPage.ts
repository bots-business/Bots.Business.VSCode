export function getCommandViewPage(command:any){
    return`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>My Website Form</title>
      <style>
        body {
          background-color: var(--vscode-editor-background);
          font-family: var(--vscode-editor-font-family);
          font-size: var(--vscode-editor-font-size);
        }

        body.vscode-light {
          color: black;
        }
        
        body.vscode-dark {
          color: white;
        }
        
        body.vscode-high-contrast {
          color: red;
        }

        input[type="text"],input[type="number"], textarea {
          display: block;
          width: 100%;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0px;
          color: var(--vscode-commandCenter-foreground);
          background-color: var(--vscode-commandCenter-background);
          border: 1px solid var(--vscode-commandCenter-border);
        }

        input[type="text"]:focus,input[type="number"]:focus, textarea:focus{
          outline: 1px solid var(--vscode-commandCenter-activeBorder);
        }

        textarea{
          resize: none;
          height: 100px;
        }
        .form-center {
          width:90%;
          margin: 0 auto;
        }
        input[type="submit"] {
          background-color: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          padding: 10px 20px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
        }
    
        input[type="submit"]:hover {
          background-color: var(--vscode-button-hoverBackground);
          color: var(--vscode-button-foregroundd);
        }
    
        .checkbox-label {
          display: block;
          position: relative;
          padding-left: 30px;
          margin-bottom: 10px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1.5;
        }
    
        .checkbox-label input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
    
        .checkbox-checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: var(--vscode-commandCenter-background);         
          border-radius: 3px;
          border: 1px solid var(--vscode-commandCenter-border);
        }
    
        .checkbox-label input[type="checkbox"]:checked ~ .checkbox-checkmark:after {
          content: "";
          position: absolute;
          display: block;
          left: 7px;
          top: 4px;
          width: 4px;
          height: 10px;
          border: solid var(--vscode-commandCenter-foreground);
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
      </style>
    </head>
    <body>
      <h2 style="text-align: center;">Command Page</h2>
      <div class="form-center">
      <form style="margin:0px auto;width:90%>
        <label for="command">Command:</label>
        <input type="text" id="command" name="command" value="${command.command}" disabled>
    
        <label for="answer">Answer:</label>
        <textarea id="answer" name="answer" disabled>${command.answer||""}</textarea>

        <label for="aliases">Aliases:</label>
        <input type="text" id="aliases" name="aliases" value="${(command.aliases.map((aliases:any) => aliases.command)).join(', ')}" disabled>

        <label for="help">Help:</label>
        <input type="text" id="help" name="help" value="${command.help||""}" disabled>
    
        <label for="keyboard">Keyboard:</label>
        <input type="text" id="keyboard" name="keyboard" value="${command.keyboard_body||""}" disabled>
      
        <label for="allowed-groups">Allowed only for group:</label>
        <input type="text" id="allowed-groups" name="allowed-groups" value="${command.commands_group?.title||""}" disabled>

        <label for="auto_retry_time">Auto Retry:</label>
        <input type="number" id="auto_retry_time" name="auto_retry_time" value="${command.auto_retry_time||""}" disabled>

        <label class="checkbox-label">
          <input type="checkbox" id="wait-for-answer" name="wait-for-answer" ${command.need_reply?"checked":""} disabled>
          <span class="checkbox-checkmark"></span>
          Wait for answer
        </label>
    
      </form>
      </div>
    </body>
    </html>
    
    `
}

