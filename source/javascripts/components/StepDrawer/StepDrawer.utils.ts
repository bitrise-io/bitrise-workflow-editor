import capitalize from 'lodash/capitalize';

export const displayCategoryName = (category: string) => capitalize(category).replace('-', ' ');
