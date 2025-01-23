import { authResolvers } from './authResolvers';
import { patientResolvers } from './patientResolvers';
import { medicationResolvers } from './medicationResolvers';
import { prescriptionResolvers } from './prescriptionResolvers';
import { healthMetricResolvers } from './healthMetricResolvers';
import { analyticsResolvers } from './analyticsResolvers';
import { GraphQLScalarType, Kind } from 'graphql';

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.STRING) return JSON.parse(ast.value);
    return null;
  },
});

export const resolvers = {
  DateTime: dateTimeScalar,
  JSON: jsonScalar,
  Query: {
    ...authResolvers.Query,
    ...patientResolvers.Query,
    ...medicationResolvers.Query,
    ...prescriptionResolvers.Query,
    ...healthMetricResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...patientResolvers.Mutation,
    ...prescriptionResolvers.Mutation,
    ...healthMetricResolvers.Mutation,
  },
};
