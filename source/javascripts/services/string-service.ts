import * as _ from 'underscore';

class StringService {
  private templateRegexp: RegExp;

  constructor() {
    this.templateRegexp = /<([a-zA-Z0-9\-_.]+)>/g;
    _.templateSettings.interpolate = this.templateRegexp;
  }

  private defaultTemplateDataFromString(string: string): any {
    const data: Record<string, string> = {};
    let match = this.templateRegexp.exec(string);
    while (match !== null) {
      const [full, key] = match;
      data[key] = full;
      match = this.templateRegexp.exec(string);
    }
    return data;
  }

  stringReplacedWithParameters(string: string, parameters: any): string {
    let resultString = '';
    const compiled = _.template(string);

    try {
      resultString = compiled(parameters);
    } catch {
      const defaultParams = this.defaultTemplateDataFromString(string);
      resultString = compiled(_.defaults(parameters, defaultParams));
    }

    return resultString;
  }

  joinedString = function (
    strings: string[] | null | undefined,
    separator: string,
    shouldLeaveSpaceAfterSeparator?: boolean,
  ): string {
    if (!strings) {
      return '';
    }

    let joinedString = '';

    if (strings.length === 0) {
      return joinedString;
    }

    if (separator === null || separator === undefined) {
      separator = '';
    }

    if (shouldLeaveSpaceAfterSeparator === undefined) {
      shouldLeaveSpaceAfterSeparator = _.contains([',', ';'], separator);
    }

    _.each(strings, function (aString, index) {
      if (aString === null || aString === undefined) {
        aString = '';
      }

      aString = aString.toString();

      if (index > 0 && aString.length > 0) {
        joinedString += separator;

        if (shouldLeaveSpaceAfterSeparator) {
          joinedString += ' ';
        }
      }

      joinedString += aString;
    });

    return joinedString;
  };

  capitalizedFirstLetter(string: string): string {
    if (!string) {
      return string;
    }

    return string[0].toUpperCase() + string.slice(1);
  }

  isStringMatchingTerm(string: string, term: string): boolean | undefined {
    if (string === undefined || term === undefined) {
      return undefined;
    }

    if (term.length === 0) {
      return true;
    }

    return string.toLowerCase().indexOf(term.toLowerCase()) !== -1;
  }

  errorMessageFromErrors(errors: Error[]): string {
    const errorMessages = _.map(errors, function (anError) {
      return anError.message;
    });

    let errorMessage = this.joinedString(errorMessages, ',');
    errorMessage = this.capitalizedFirstLetter(errorMessage);
    errorMessage += '.';

    return errorMessage;
  }
}

export default new StringService();
