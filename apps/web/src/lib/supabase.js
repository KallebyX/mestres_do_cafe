// Temporary supabase mock to prevent build errors
// This should be replaced with actual supabase configuration

const supabaseMock = {
  from: (table) => ({
    select: () => ({
      limit: () => ({
        then: (callback) => callback({ data: [], error: null }),
        catch: () => ({ data: [], error: null })
      }),
      eq: () => ({
        then: (callback) => callback({ data: [], error: null }),
        catch: () => ({ data: [], error: null })
      }),
      gte: () => ({
        then: (callback) => callback({ data: [], error: null }),
        catch: () => ({ data: [], error: null })
      }),
      order: () => ({
        then: (callback) => callback({ data: [], error: null }),
        catch: () => ({ data: [], error: null })
      })
    }),
    insert: () => ({
      then: (callback) => callback({ data: null, error: null }),
      catch: () => ({ data: null, error: null })
    }),
    update: () => ({
      then: (callback) => callback({ data: null, error: null }),
      catch: () => ({ data: null, error: null })
    }),
    delete: () => ({
      then: (callback) => callback({ data: null, error: null }),
      catch: () => ({ data: null, error: null })
    })
  })
};

export const supabase = supabaseMock;