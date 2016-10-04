import { Component } from '@angular/core';<% if (isMobile) { %>
import { APP_SHELL_DIRECTIVES } from '@angular/app-shell';<% } %>

@Component({
  selector: '<%= prefix %>-root',<% if (inlineTemplate) { %>
  template: `
  <h1>
    {{title}}
  </h1>
  `,<% } else { %>
  templateUrl: './app.component.pug',<% } %><% if (inlineStyle) { %>
  styles: []<% } else { %>
  styleUrls: ['./app.component.less']<% } %>
})
export class AppComponent {
  title = '<%= prefix %> works!';
}
