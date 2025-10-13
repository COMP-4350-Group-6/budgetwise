export interface UserProps {
  id: string;
  email: string;
  name: string;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(public readonly props: UserProps) {
    if (!this.isValidEmail(props.email)) {
      throw new Error("Invalid email format");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get defaultCurrency(): string {
    return this.props.defaultCurrency;
  }
}