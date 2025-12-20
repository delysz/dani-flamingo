import { defineField, defineType } from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Photos', // Nombre de la sección en el panel
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Landscapes', value: 'landscapes' },
          { title: 'Portraits', value: 'portraits' },
          { title: 'Events', value: 'events' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Photo File',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    }),
  ],
})